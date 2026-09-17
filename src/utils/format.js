// Formatea un número como precio en pesos colombianos: 59900 -> "$59.900"
export function formatPrice(value) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}
