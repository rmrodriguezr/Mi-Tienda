import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { formatPrice } from "../utils/format";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  function handleAddToCart(e) {
    e.preventDefault();
    addToCart(product, 1);
  }

  return (
    <Link to={`/producto/${product.id}`} className="product-card">
      <div className="product-card__image-wrap">
        {product.oferta && <span className="product-card__badge product-card__badge--offer">Oferta</span>}
        {!product.oferta && product.destacado && (
          <span className="product-card__badge product-card__badge--featured">Destacado</span>
        )}
        <img src={product.imagen} alt={product.nombre} className="product-card__image" loading="lazy" />
      </div>

      <div className="product-card__body">
        <span className="product-card__category">{product.categoria}</span>
        <h3 className="product-card__name">{product.nombre}</h3>

        <div className="product-card__prices">
          <span className="product-card__price">{formatPrice(product.precio)}</span>
          {product.precioAnterior && (
            <span className="product-card__price-old">{formatPrice(product.precioAnterior)}</span>
          )}
        </div>

        <button
          className="btn btn--primary product-card__cta"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <FiShoppingCart />
          {product.stock === 0 ? "Agotado" : "Agregar"}
        </button>
      </div>
    </Link>
  );
}
