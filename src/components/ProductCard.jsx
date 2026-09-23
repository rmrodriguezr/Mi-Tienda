import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { formatPrice } from "../utils/format";
import { getEffectivePrice } from "../utils/pricing";
import { handleImageError } from "../utils/image";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function ProductCard({ product, categoryName }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const outOfStock = !product.stock || product.stock <= 0;
  const precioFinal = getEffectivePrice(product);

  function handleAddToCart(e) {
    e.preventDefault();
    if (outOfStock) return;
    const { cappedByStock } = addToCart(
      {
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        precioPromocion: product.precioPromocion,
        enPromocion: product.enPromocion,
        imagen: product.imagen,
        stock: product.stock,
      },
      1
    );
    showToast(
      cappedByStock
        ? `Solo queda stock disponible de ${product.nombre} (stock máximo alcanzado).`
        : `✓ ${product.nombre} agregado al carrito`,
      "success"
    );
  }

  return (
    <Link to={`/producto/${product.id}`} className="product-card">
      <div className="product-card__image-wrap">
        {outOfStock && (
          <span className="product-card__badge product-card__badge--out">Agotado</span>
        )}
        {!outOfStock && product.enPromocion && product.descuento > 0 && (
          <span className="product-card__badge product-card__badge--offer">
            🔥 -{product.descuento}%
          </span>
        )}
        {!outOfStock && !product.enPromocion && product.destacado && (
          <span className="product-card__badge product-card__badge--featured">Destacado</span>
        )}
        <img
          src={product.imagen}
          alt={product.nombre}
          className="product-card__image"
          width="400"
          height="400"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
      </div>

      <div className="product-card__body">
        {categoryName && <span className="product-card__category">{categoryName}</span>}
        <h3 className="product-card__name">{product.nombre}</h3>
        {(product.descripcion || product.descripcionCorta) && (
          <p className="product-card__desc">{product.descripcion || product.descripcionCorta}</p>
        )}

        <div className="product-card__prices">
          <span className="product-card__price">{formatPrice(precioFinal)}</span>
          {product.enPromocion && (
            <span className="product-card__price-old">{formatPrice(product.precio)}</span>
          )}
        </div>

        <button
          className="btn btn--primary product-card__cta"
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          <FiShoppingCart />
          {outOfStock ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>
    </Link>
  );
}
