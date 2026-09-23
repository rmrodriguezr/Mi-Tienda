import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from "../../services/categoryService";
import { getAllProducts } from "../../services/productService";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function CategoriesAdmin() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [productCountByCategory, setProductCountByCategory] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [cats, products] = await Promise.all([getAllCategories(), getAllProducts()]);
      setCategories(cats);
      const counts = {};
      products.forEach((p) => {
        if (p.categoriaId) counts[p.categoriaId] = (counts[p.categoriaId] || 0) + 1;
      });
      setProductCountByCategory(counts);
    } catch (err) {
      console.error(err);
      setError("No fue posible cargar las categorías. Verifica la conexión con Firebase.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(category) {
    setEditingId(category.id);
    setName(category.nombre);
    setDescription(category.descripcion || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    const trimmed = name.trim();
    if (!trimmed) {
      showToast("El nombre de la categoría es obligatorio.", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, { nombre: trimmed, descripcion: description.trim() });
        showToast("Categoría actualizada.", "success");
      } else {
        await createCategory({ nombre: trimmed, descripcion: description.trim(), activo: true });
        showToast("Categoría creada.", "success");
      }
      cancelEdit();
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("No se pudo guardar la categoría.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(category) {
    try {
      await toggleCategoryActive(category.id, !category.activo);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("No se pudo actualizar el estado.", "error");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    if (productCountByCategory[toDelete.id]) {
      showToast(
        "Esta categoría tiene productos asociados. Desactívala o reasigna los productos antes de eliminarla.",
        "error"
      );
      setToDelete(null);
      return;
    }
    try {
      await deleteCategory(toDelete.id);
      showToast("Categoría eliminada.", "success");
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("No se pudo eliminar la categoría.", "error");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Categorías</h1>
          <p>Organiza los productos de tu tienda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>
          {editingId ? "Editar categoría" : "Nueva categoría"}
        </h3>
        <div className="form-row">
          <div className="form-field">
            <label>Nombre *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Belleza" />
          </div>
          <div className="form-field">
            <label>Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>
        <div className="admin-form-actions" style={{ marginTop: 0 }}>
          {editingId && (
            <button type="button" className="btn btn--outline" onClick={cancelEdit} disabled={saving}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Guardando..." : editingId ? "Guardar cambios" : "+ Nueva categoría"}
          </button>
        </div>
      </form>

      {loading ? (
        <p>Cargando categorías...</p>
      ) : error ? (
        <div className="admin-login__error">
          {error}{" "}
          <button className="btn btn--outline" style={{ marginLeft: "0.75rem" }} onClick={loadData}>
            Reintentar
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="admin-empty">No hay categorías todavía.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--responsive">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td data-label="Nombre" className="admin-table__name">{category.nombre}</td>
                  <td data-label="Descripción" style={{ color: "var(--color-text-muted)" }}>
                    {category.descripcion || "—"}
                  </td>
                  <td data-label="Productos">{productCountByCategory[category.id] || 0}</td>
                  <td data-label="Estado">
                    <span className={`status-pill ${category.activo ? "status-pill--active" : "status-pill--inactive"}`}>
                      {category.activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className="admin-table__actions">
                      <button className="icon-btn" onClick={() => startEdit(category)} aria-label="Editar">
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleToggleActive(category)}
                        aria-label={category.activo ? "Desactivar" : "Activar"}
                      >
                        {category.activo ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                      <button className="icon-btn icon-btn--danger" onClick={() => setToDelete(category)} aria-label="Eliminar">
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
        title="Eliminar categoría"
        message={`¿Seguro que quieres eliminar "${toDelete?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
