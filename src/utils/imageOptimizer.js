// Optimización de imágenes de producto 100% en el navegador (Canvas + FileReader
// nativos, sin librerías externas): redimensiona manteniendo proporción, convierte
// a WebP (con fallback a JPEG si el navegador no lo soporta) y comprime con
// reintentos progresivos hasta acercarse a un tamaño objetivo.

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const DEFAULTS = {
  maxDimension: 800,
  minDimension: 400,
  targetSizeKB: 120,
  initialQuality: 0.85,
  minQuality: 0.4,
  qualityStep: 0.1,
  maxAttempts: 12,
};

// Límite real de Firestore por documento (1 MiB). Se deja margen para el resto
// de los campos del producto (nombre, precio, etc.).
export const FIRESTORE_DOC_LIMIT_BYTES = 1024 * 1024;
export const MAX_BASE64_BYTES = 950 * 1024;

let webpSupportCache = null;
function supportsWebP() {
  if (webpSupportCache !== null) return webpSupportCache;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  webpSupportCache = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return webpSupportCache;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen. Verifica que el archivo no esté dañado."));
    };
    img.src = url;
  });
}

// Calcula dimensiones que caben en maxDimension x maxDimension sin deformar la imagen.
function computeDimensions(width, height, maxDimension) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  const scale = width > height ? maxDimension / width : maxDimension / height;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo procesar la imagen en el navegador."));
      },
      type,
      quality
    );
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo convertir la imagen a Base64."));
    reader.readAsDataURL(blob);
  });
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Redimensiona, convierte y comprime una imagen hasta acercarse al tamaño objetivo.
 * @param {File} file
 * @param {object} [options]
 * @returns {Promise<{base64:string, blob:Blob, sizeBytes:number, sizeKB:number,
 *   width:number, height:number, type:string, originalSizeBytes:number}>}
 */
export async function optimizeImage(file, options = {}) {
  if (!file) {
    throw new Error("No se seleccionó ninguna imagen.");
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Formato no soportado. Usa JPG, PNG o WebP.");
  }

  const {
    maxDimension,
    minDimension,
    targetSizeKB,
    initialQuality,
    minQuality,
    qualityStep,
    maxAttempts,
  } = { ...DEFAULTS, ...options };

  const outputType = supportsWebP() ? "image/webp" : "image/jpeg";
  const targetBytes = targetSizeKB * 1024;

  const img = await loadImageFromFile(file);
  let { width, height } = computeDimensions(img.naturalWidth, img.naturalHeight, maxDimension);

  let quality = initialQuality;
  let blob = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Tu navegador no soporta el procesamiento de imágenes (canvas).");
    ctx.drawImage(img, 0, 0, width, height);

    blob = await canvasToBlob(canvas, outputType, quality);

    const reachedTarget = blob.size <= targetBytes;
    const atFloor = quality <= minQuality && width <= minDimension;
    if (reachedTarget || atFloor) break;

    if (quality > minQuality) {
      quality = Math.max(minQuality, quality - qualityStep);
    } else {
      width = Math.max(minDimension, Math.round(width * 0.85));
      height = Math.max(minDimension, Math.round(height * 0.85));
    }
  }

  if (!blob) {
    throw new Error("No se pudo optimizar la imagen.");
  }

  const base64 = await blobToBase64(blob);

  if (base64.length > MAX_BASE64_BYTES) {
    throw new Error(
      "La imagen optimizada sigue siendo demasiado grande para guardarla en Firestore " +
        "(límite de 1 MB por producto). Prueba con una foto menos detallada o recórtala antes de subirla."
    );
  }

  return {
    base64,
    blob,
    sizeBytes: blob.size,
    sizeKB: Math.round(blob.size / 1024),
    width,
    height,
    type: outputType,
    originalSizeBytes: file.size,
  };
}
