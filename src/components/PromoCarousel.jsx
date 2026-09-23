import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiShoppingCart } from "react-icons/fi";
import { formatPrice } from "../utils/format";
import { getEffectivePrice } from "../utils/pricing";
import { handleImageError } from "../utils/image";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function PromoCarousel({ products }) {
  const [index, setIndex] = useState(0);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (products.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [products.length]);

  if (products.length === 0) {
    return (
      <div className="promo-carousel--empty">
        <p>Pronto tendremos nuevas ofertas especiales. ¡Vuelve a visitarnos!</p>
      </div>
    );
  }

  function goTo(i) {
    setIndex((i + products.length) % products.length);
  }

  function handleAddToCart(e, product) {
    e.preventDefault();
    e.stopPropagation();
    const outOfStock = !product.stock || product.stock <= 0;
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
    <section className="promo-carousel">
      {products.length > 1 && (
        <button
          className="promo-carousel__arrow promo-carousel__arrow--prev"
          onClick={() => goTo(index - 1)}
          aria-label="Anterior"
        >
          <FiChevronLeft size={22} />
        </button>
      )}

      <div
        className="promo-carousel__track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {products.map((product, slideIndex) => (
          <Link to={`/producto/${product.id}`} className="promo-carousel__slide" key={product.id}>
            <div className="promo-carousel__inner">
              <div>
                <span className="promo-carousel__kicker">🔥 Ofertas especiales</span>
                <h2 className="promo-carousel__title">{product.nombre}</h2>
                <p className="promo-carousel__desc">
                  {product.descripcion || product.descripcionCorta || "Producto seleccionado con descuento especial."}
                </p>
                <div className="promo-carousel__prices">
                  <span className="promo-carousel__price">
                    {formatPrice(getEffectivePrice(product))}
                  </span>
                  {product.enPromocion && product.precioPromocion < product.precio && (
                    <span className="promo-carousel__price-old">{formatPrice(product.precio)}</span>
                  )}
                </div>
                <button
                  className="btn btn--primary"
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={!product.stock || product.stock <= 0}
                >
                  <FiShoppingCart /> {!product.stock || product.stock <= 0 ? "Agotado" : "Agregar al carrito"}
                </button>
              </div>
              <div className="promo-carousel__image-wrap">
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="promo-carousel__image"
                  width="420"
                  height="420"
                  loading={slideIndex === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onError={handleImageError}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {products.length > 1 && (
        <>
          <button
            className="promo-carousel__arrow promo-carousel__arrow--next"
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente"
          >
            <FiChevronRight size={22} />
          </button>

          <div className="promo-carousel__dots">
            {products.map((product, i) => (
              <button
                key={product.id}
                className={`promo-carousel__dot ${i === index ? "promo-carousel__dot--active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Ir a slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
