// Placeholder neutro (SVG inline) para cuando la imagen de un producto no carga.
export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#F5F7FA"/>
      <path d="M140 260h120l-35-55-25 30-20-25z" fill="#CBD5E1"/>
      <circle cx="160" cy="160" r="18" fill="#CBD5E1"/>
      <rect x="100" y="100" width="200" height="200" rx="12" fill="none" stroke="#CBD5E1" stroke-width="4"/>
    </svg>`
  );

// Handler reutilizable para <img onError={handleImageError}>: evita bucles de
// error si el propio placeholder llegara a fallar.
export function handleImageError(e) {
  if (e.target.src !== FALLBACK_IMAGE) {
    e.target.src = FALLBACK_IMAGE;
  }
}
