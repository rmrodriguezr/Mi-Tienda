// Precio efectivo de un producto: usa el precio promocional solo si la promoción
// está activa y es realmente menor que el precio normal. Se usa en ProductCard,
// ProductDetail, CartContext y el mensaje de WhatsApp para no duplicar esta regla.
export function getEffectivePrice(product) {
  return product.enPromocion && product.precioPromocion && product.precioPromocion < product.precio
    ? product.precioPromocion
    : product.precio;
}
