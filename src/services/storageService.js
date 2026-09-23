// Subida de imágenes de productos a Cloudinary (plan gratuito, sin tarjeta).
// Usa un "unsigned upload preset": el navegador sube el archivo directamente a
// Cloudinary sin exponer ninguna clave secreta. Cloud name y preset se leen de
// variables de entorno (Cloudinary > Dashboard, y Settings > Upload > Upload presets).
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryReady = Boolean(CLOUD_NAME && UPLOAD_PRESET);

if (!cloudinaryReady) {
  console.warn(
    "[Cloudinary] Faltan VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET " +
      "en tu .env. La subida de imágenes de productos no funcionará hasta completarlas."
  );
}

// Sube la imagen con seguimiento de progreso real (XMLHttpRequest, ya que fetch()
// no expone eventos de progreso de subida). onProgress(percent) se llama en vivo.
export function uploadProductImage(file, onProgress) {
  if (!cloudinaryReady) {
    return Promise.reject(
      new Error(
        "Cloudinary no está configurado. Completa VITE_CLOUDINARY_CLOUD_NAME y " +
          "VITE_CLOUDINARY_UPLOAD_PRESET en tu archivo .env."
      )
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "products");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } catch {
          reject(new Error("Cloudinary devolvió una respuesta inválida."));
        }
      } else {
        reject(new Error(`No se pudo subir la imagen (código ${xhr.status}).`));
      }
    };

    xhr.onerror = () => reject(new Error("Error de red al subir la imagen a Cloudinary."));
    xhr.send(formData);
  });
}

// Cloudinary no permite eliminar imágenes desde el navegador sin una petición
// firmada con una clave secreta (requeriría un backend, que este proyecto no tiene).
// Las imágenes de productos reemplazados o eliminados quedan almacenadas en
// Cloudinary; el plan gratuito incluye 25 GB, más que suficiente para una tienda
// pequeña/mediana. Se mantiene esta función (no-op) para no romper quienes la llaman.
export async function deleteProductImage() {
  // Intencionalmente vacío — ver comentario arriba.
}
