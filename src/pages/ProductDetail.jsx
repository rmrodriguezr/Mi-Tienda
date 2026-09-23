import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { getProductById } from "../services/productService";
import { getActiveCategories } from "../services/categoryService";
import { formatPrice } from "../utils/format";
import { getEffectivePrice } from "../utils/pricing";
import { handleImageError } from "../utils/image";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  useDocumentTitle(product ? product.nombre : "Producto");
  const [categoryName, setCategoryName] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setCantidad(1);

    async function load() {
      try {
        const [prod, cats] = await Promise.all([getProductById(id), getActiveCategories()]);
        if (!active) return;
        // Un producto desactivado por el admin no debe ser visible públicamente,
        // aunque alguien tenga el link directo.
        const visibleProduct = prod && prod.activo ? prod : null;
        setProduct(visibleProduct);
        if (visibleProduct) {
          const cat = cats.find((c) => c.id === visibleProduct.categoriaId);
          setCategoryName(cat ? cat.nombre : "");
        }
      } catch (err) {
        console.error("Error cargando el producto:", err);
        if (active) {
          setError("No fue posible cargar el producto. Verifica tu conexión e intenta de nuevo.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id, reloadToken]);

  if (loading) {
    return (
      <div className="product-detail">
        <div className="skeleton product-detail__image-wrap" />
        <div>
          <div className="skeleton" style={{ height: 14, width: "30%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 32, width: "70%", marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 100, width: "100%" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail product-detail--not-found">
        <div className="public-error" style={{ marginBottom: "1.5rem" }}>{error}</div>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="btn btn--secondary" onClick={() => setReloadToken((t) => t + 1)}>
            Reintentar
          </button>
          <Link to="/catalogo" className="btn btn--primary">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail product-detail--not-found">
        <h1>Producto no encontrado</h1>
        <Link to="/catalogo" className="btn btn--primary">Volver al catálogo</Link>
      </div>
    );
  }

  const outOfStock = !product.stock || product.stock <= 0;
  const precioFinal = getEffectivePrice(product);

  function handleAddToCart() {
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
      cantidad
    );
    showToast(
      cappedByStock
        ? `Solo se agregó el stock disponible de ${product.nombre} (stock máximo alcanzado).`
        : `✓ ${product.nombre} agregado al carrito`,
      "success"
    );
  }

  function handleBuyOnWhatsApp() {
    handleAddToCart();
    navigate("/carrito");
  }

  return (
    <div className="product-detail">
      <div className="product-detail__image-wrap">
        <img
          src={product.imagen}
          alt={product.nombre}
          className="product-detail__image"
          width="600"
          height="600"
          decoding="async"
          fetchPriority="high"
          onError={handleImageError}
        />
      </div>

      <div className="product-detail__info">
        {categoryName && <span className="product-detail__category">{categoryName}</span>}
        <h1 className="product-detail__name">{product.nombre}</h1>

        <div className="product-detail__prices">
          <span className="product-detail__price">{formatPrice(precioFinal)}</span>
          {product.enPromocion && (
            <>
              <span className="product-detail__price-old">{formatPrice(product.precio)}</span>
              <span className="badge-discount">-{product.descuento}%</span>
            </>
          )}
        </div>

        <p className="product-detail__description">{product.descripcion}</p>

        <p className="product-detail__stock">
          {outOfStock ? (
            <span className="badge-out">Producto agotado</span>
          ) : product.stock <= 5 ? (
            <span className="badge-warning">Pocas unidades — quedan {product.stock}</span>
          ) : (
            `Stock disponible: ${product.stock}`
          )}
        </p>

        {!outOfStock && (
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
                  disabled={cantidad >= product.stock}
                >
                  <FiPlus />
                </button>
              </div>
              {cantidad >= product.stock && (
                <span className="form-hint">Stock máximo alcanzado</span>
              )}
            </div>

            <div className="product-detail__actions">
              <button className="btn btn--primary" onClick={handleAddToCart}>
                <FiShoppingCart /> Agregar al carrito
              </button>
              <button className="btn btn--whatsapp" onClick={handleBuyOnWhatsApp}>
                <FaWhatsapp size={20} /> Comprar ahora
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
