// Calcula el porcentaje de descuento entre un precio normal y uno de promoción.
// calculateDiscount(100000, 75000) -> 25
export function calculateDiscount(precio, precioPromocion) {
  if (!precio || !precioPromocion || precioPromocion >= precio) return 0;
  return Math.round(((precio - precioPromocion) / precio) * 100);
}
