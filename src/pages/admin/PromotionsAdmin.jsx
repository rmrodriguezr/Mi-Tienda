import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts, updateProduct } from "../../services/productService";
import { formatPrice } from "../../utils/format";
import { handleImageError } from "../../utils/image";
import { useToast } from "../../context/ToastContext";

const TABS = [
  { key: "promocion", label: "Promociones", field: "enPromocion" },
  { key: "destacado", label: "Destacados", field: "destacado" },
  { key: "carrusel", label: "Carrusel", field: "mostrarEnCarrusel" },
];

const EMPTY_MESSAGES = {
  promocion: "No hay promociones activas actualmente.",
  destacado: "No hay productos destacados actualmente.",
  carrusel: "No hay productos seleccionados para el carrusel.",
};

const TOGGLE_LABELS = {
  enPromocion: { activate: "Promoción activada.", deactivate: "Promoción desactivada." },
  destacado: { activate: "Producto marcado como destacado.", deactivate: "Producto quitado de destacados." },
  mostrarEnCarrusel: { activate: "Producto agregado al carrusel.", deactivate: "Producto quitado del carrusel." },
};

export default function PromotionsAdmin() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("promocion");
  const [togglingId, setTogglingId] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const prods = await getAllProducts();
      setProducts(prods);
    } catch (err) {
      console.error(err);
      setError("No fue posible cargar los productos. Verifica la conexión con Firebase.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTab = TABS.find((t) => t.key === tab);

  const filteredProducts = useMemo(
    () => products.filter((p) => p[activeTab.field]),
    [products, activeTab.field]
  );

  async function handleToggle(product, field) {
    const nextValue = !product[field];

    if (field === "enPromocion" && nextValue) {
      const promo = Number(product.precioPromocion);
      if (!promo || promo <= 0 || promo >= Number(product.precio)) {
        showToast(
          "Este producto no tiene un precio promocional válido. Edítalo primero para definirlo.",
          "error"
        );
        return;
      }
    }

    setTogglingId(product.id);
    try {
      const { id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = product;
      await updateProduct(id, { ...rest, [field]: nextValue });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: nextValue } : p))
      );
      const labels = TOGGLE_LABELS[field];
      showToast(nextValue ? labels.activate : labels.deactivate, "success");
    } catch (err) {
      console.error(err);
      showToast("No se pudo actualizar el producto.", "error");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Promociones, destacados y carrusel</h1>
          <p>
            El precio promocional se define desde la edición del producto. Aquí puedes
            revisar y activar/desactivar dónde aparece cada uno.
          </p>
        </div>
      </div>

      <div className="promo-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`promo-tabs__item ${tab === t.key ? "promo-tabs__item--active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <div className="admin-login__error">
          {error}{" "}
          <button className="btn btn--outline" style={{ marginLeft: "0.75rem" }} onClick={loadData}>
            Reintentar
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-empty">
          {EMPTY_MESSAGES[tab]} Ve a <Link to="/admin/productos">Productos</Link> para
          gestionarlo.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--responsive">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Descuento</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Promoción</th>
                <th>Destacado</th>
                <th>Carrusel</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td data-label="Imagen">
                    <img src={product.imagen} alt={product.nombre} onError={handleImageError} />
                  </td>
                  <td data-label="Nombre" className="admin-table__name">{product.nombre}</td>
                  <td data-label="Precio">
                    {product.enPromocion ? (
                      <>
                        <span style={{ textDecoration: "line-through", color: "var(--color-text-muted)", marginRight: 6 }}>
                          {formatPrice(product.precio)}
                        </span>
                        <span style={{ fontWeight: 700, color: "var(--color-secondary)" }}>
                          {formatPrice(product.precioPromocion)}
                        </span>
                      </>
                    ) : (
                      formatPrice(product.precio)
                    )}
                  </td>
                  <td data-label="Descuento">{product.enPromocion ? `${product.descuento}%` : "—"}</td>
                  <td data-label="Stock">
                    {product.stock > 0 ? product.stock : <span className="status-pill status-pill--out">Agotado</span>}
                  </td>
                  <td data-label="Estado">
                    <span className={`status-pill ${product.activo ? "status-pill--active" : "status-pill--inactive"}`}>
                      {product.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td data-label="Promoción">
                    <button
                      className={`status-pill ${product.enPromocion ? "status-pill--promo" : "status-pill--inactive"}`}
                      onClick={() => handleToggle(product, "enPromocion")}
                      disabled={togglingId === product.id}
                    >
                      {product.enPromocion ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td data-label="Destacado">
                    <button
                      className={`status-pill ${product.destacado ? "status-pill--active" : "status-pill--inactive"}`}
                      onClick={() => handleToggle(product, "destacado")}
                      disabled={togglingId === product.id}
                    >
                      {product.destacado ? "Sí" : "No"}
                    </button>
                  </td>
                  <td data-label="Carrusel">
                    <button
                      className={`status-pill ${product.mostrarEnCarrusel ? "status-pill--active" : "status-pill--inactive"}`}
                      onClick={() => handleToggle(product, "mostrarEnCarrusel")}
                      disabled={togglingId === product.id}
                    >
                      {product.mostrarEnCarrusel ? "Sí" : "No"}
                    </button>
                  </td>
                  <td data-label="Acciones">
                    <Link className="icon-btn" to={`/admin/productos/${product.id}`} aria-label="Editar">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
