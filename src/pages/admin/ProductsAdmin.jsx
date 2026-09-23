import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import {
  getAllProducts,
  deleteProduct,
  toggleProductActive,
} from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import { deleteProductImage } from "../../services/storageService";
import { formatPrice } from "../../utils/format";
import { handleImageError } from "../../utils/image";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function ProductsAdmin() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [categoriesById, setCategoriesById] = useState({});
  const [toDelete, setToDelete] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [prods, cats] = await Promise.all([getAllProducts(), getAllCategories()]);
      setProducts(prods);
      setCategoriesById(Object.fromEntries(cats.map((c) => [c.id, c.nombre])));
    } catch (err) {
      console.error(err);
      setError("No fue posible cargar los productos. Verifica la configuración de Firebase.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleActive(product) {
    try {
      await toggleProductActive(product.id, !product.activo);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, activo: !p.activo } : p))
      );
      showToast(`Producto ${!product.activo ? "activado" : "desactivado"}.`, "success");
    } catch (err) {
      console.error(err);
      showToast("No se pudo actualizar el estado.", "error");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteProduct(toDelete.id);
      if (toDelete.imagen) await deleteProductImage(toDelete.imagen);
      setProducts((prev) => prev.filter((p) => p.id !== toDelete.id));
      showToast("Producto eliminado.", "success");
    } catch (err) {
      console.error(err);
      showToast("No se pudo eliminar el producto.", "error");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Productos</h1>
          <p>Gestiona el catálogo de tu tienda</p>
        </div>
        <Link to="/admin/productos/nuevo" className="btn btn--primary">+ Agregar producto</Link>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : error ? (
        <div className="admin-login__error">
          {error}{" "}
          <button className="btn btn--outline" style={{ marginLeft: "0.75rem" }} onClick={loadData}>
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="admin-empty">No hay productos todavía. Crea el primero.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--responsive">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Promoción</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td data-label="Imagen">
                    <img src={product.imagen} alt={product.nombre} onError={handleImageError} />
                  </td>
                  <td data-label="Nombre" className="admin-table__name">{product.nombre}</td>
                  <td data-label="Categoría">{categoriesById[product.categoriaId] || "—"}</td>
                  <td data-label="Precio">
                    {formatPrice(product.precio)}
                    {product.enPromocion && (
                      <div style={{ fontSize: "0.75rem", color: "var(--color-secondary)" }}>
                        {formatPrice(product.precioPromocion)} (-{product.descuento}%)
                      </div>
                    )}
                  </td>
                  <td data-label="Promoción">
                    {product.enPromocion ? (
                      <span className="status-pill status-pill--promo">Sí</span>
                    ) : (
                      "No"
                    )}
                  </td>
                  <td data-label="Stock">
                    {product.stock > 0 ? product.stock : <span className="status-pill status-pill--out">Agotado</span>}
                  </td>
                  <td data-label="Estado">
                    <span className={`status-pill ${product.activo ? "status-pill--active" : "status-pill--inactive"}`}>
                      {product.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className="admin-table__actions">
                      <Link className="icon-btn" to={`/admin/productos/${product.id}`} aria-label="Editar">
                        <FiEdit2 size={15} />
                      </Link>
                      <button
                        className="icon-btn"
                        onClick={() => handleToggleActive(product)}
                        aria-label={product.activo ? "Desactivar" : "Activar"}
                      >
                        {product.activo ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                      <button
                        className="icon-btn icon-btn--danger"
                        onClick={() => setToDelete(product)}
                        aria-label="Eliminar"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar producto"
        message={`¿Seguro que quieres eliminar "${toDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
