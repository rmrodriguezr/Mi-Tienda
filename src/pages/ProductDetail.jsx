import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { PRODUCTS } from "../data/products";
import { formatPrice } from "../utils/format";
import { useCart } from "../context/CartContext";
import { buildWhatsAppLink } from "../utils/whatsapp";

export default function ProductDetail() {
  const { id } = useParams();
  const product = PRODUCTS.find((p) => String(p.id) === id);
  const { addToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);

  if (!product) {
    return (
      <div className="product-detail product-detail--not-found">
        <h1>Producto no encontrado</h1>
        <Link to="/catalogo" className="btn btn--primary">Volver al catálogo</Link>
      </div>
    );
  }

  function handleAddToCart() {
    addToCart(product, cantidad);
  }

  function handleBuyOnWhatsApp() {
    const link = buildWhatsAppLink([
      {
        nombre: product.nombre,
        precio: product.precio,
        cantidad,
      },
    ]);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="product-detail">
      <div className="product-detail__image-wrap">
        <img src={product.imagen} alt={product.nombre} className="product-detail__image" />
      </div>

      <div className="product-detail__info">
        <span className="product-detail__category">{product.categoria}</span>
        <h1 className="product-detail__name">{product.nombre}</h1>

        <div className="product-detail__prices">
          <span className="product-detail__price">{formatPrice(product.precio)}</span>
          {product.precioAnterior && (
            <span className="product-detail__price-old">{formatPrice(product.precioAnterior)}</span>
          )}
        </div>

        <p className="product-detail__description">{product.descripcion}</p>

        <p className="product-detail__stock">
          {product.stock > 0 ? `Stock disponible: ${product.stock}` : "Producto agotado"}
        </p>

        {product.stock > 0 && (
          <>
            <div className="product-detail__qty">
              <span>Cantidad</span>
              <div className="qty-selector">
                <button
                  onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                  aria-label="Disminuir cantidad"
                >
                  <FiMinus />
                </button>
                <span>{cantidad}</span>
                <button
                  onClick={() => setCantidad((q) => Math.min(product.stock, q + 1))}
                  aria-label="Aumentar cantidad"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            <div className="product-detail__actions">
              <button className="btn btn--secondary" onClick={handleAddToCart}>
                <FiShoppingCart /> Agregar al carrito
              </button>
              <button className="btn btn--whatsapp" onClick={handleBuyOnWhatsApp}>
                <FaWhatsapp size={20} /> Comprar por WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
