import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import { seedDemoData } from "../../services/seedService";
import { useToast } from "../../context/ToastContext";
import { firebaseReady } from "../../services/firebase";

export default function Dashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [prods, cats] = await Promise.all([getAllProducts(), getAllCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
      setError(
        "No fue posible cargar los productos. Verifica la configuración de Firebase."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSeed() {
    setSeeding(true);
    try {
      await seedDemoData();
      showToast("Datos de prueba creados correctamente.", "success");
      await loadData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSeeding(false);
    }
  }

  const stats = {
    total: products.length,
    activos: products.filter((p) => p.activo).length,
    inactivos: products.filter((p) => !p.activo).length,
    promocion: products.filter((p) => p.enPromocion).length,
    agotados: products.filter((p) => !p.stock || p.stock <= 0).length,
    categorias: categories.length,
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen general de tu tienda</p>
        </div>
        <Link to="/admin/productos" className="btn btn--primary">+ Agregar producto</Link>
      </div>

      {!firebaseReady && (
        <div className="admin-login__error" style={{ marginBottom: "1.5rem" }}>
          Firebase no está configurado. Copia <code>.env.example</code> a <code>.env</code>,
          completa tus credenciales del proyecto y reinicia <code>npm run dev</code>.
        </div>
      )}

      {error && (
        <div className="admin-login__error" style={{ marginBottom: "1.5rem" }}>
          {error}{" "}
          <button className="btn btn--outline" style={{ marginLeft: "0.75rem" }} onClick={loadData}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && stats.total === 0 && (
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <p style={{ marginBottom: "0.75rem" }}>
            Todavía no tienes productos ni categorías. Puedes crear datos de prueba para
            desarrollo, o empezar a agregar tus propios productos.
          </p>
          <button className="btn btn--secondary" onClick={handleSeed} disabled={seeding}>
            {seeding ? "Creando..." : "Cargar datos de prueba"}
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card__value">{loading ? "…" : stats.total}</div>
          <div className="dashboard-card__label">Total de productos</div>
        </div>
        <div className="dashboard-card dashboard-card--secondary">
          <div className="dashboard-card__value">{loading ? "…" : stats.activos}</div>
          <div className="dashboard-card__label">Productos activos</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card__value">{loading ? "…" : stats.inactivos}</div>
          <div className="dashboard-card__label">Productos inactivos</div>
        </div>
        <div className="dashboard-card dashboard-card--accent">
          <div className="dashboard-card__value">{loading ? "…" : stats.promocion}</div>
          <div className="dashboard-card__label">En promoción</div>
        </div>
        <div className="dashboard-card dashboard-card--danger">
          <div className="dashboard-card__value">{loading ? "…" : stats.agotados}</div>
          <div className="dashboard-card__label">Agotados</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card__value">{loading ? "…" : stats.categorias}</div>
          <div className="dashboard-card__label">Categorías</div>
        </div>
      </div>
    </div>
  );
}
