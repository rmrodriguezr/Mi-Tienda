import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import PromoCarousel from "../components/PromoCarousel";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getActiveCategories } from "../services/categoryService";
import { getActiveProducts } from "../services/productService";

export default function Home() {
  useDocumentTitle("Catálogo Online");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [promos, setPromos] = useState([]);
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    async function load() {
      try {
        const [cats, products] = await Promise.all([
          getActiveCategories(),
          getActiveProducts(),
        ]);
        if (!active) return;
        setCategories(cats);
        setFeatured(products.filter((p) => p.destacado));
        setPromos(products.filter((p) => p.enPromocion));
        setCarouselProducts(products.filter((p) => p.mostrarEnCarrusel));
      } catch (err) {
        console.error("Error cargando la página de inicio:", err);
        if (active) {
          setError("No fue posible cargar la tienda. Verifica tu conexión e intenta de nuevo.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c.nombre]));

  if (error) {
    return (
      <div className="home">
        <div className="section" style={{ textAlign: "center" }}>
          <div className="public-error" style={{ marginBottom: "1rem" }}>{error}</div>
          <button className="btn btn--primary" onClick={() => setReloadToken((t) => t + 1)}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <PromoCarousel products={carouselProducts} />

      <section className="section">
        <div className="section__header">
          <div>
            <h2>Categorías</h2>
            <p className="section__subtitle">Explora por lo que más te gusta</p>
          </div>
          <Link to="/catalogo" className="section__link">Ver todas →</Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalogo?categoria=${category.id}`}
              className="category-card"
            >
              <span>{category.nombre}</span>
              <FiArrowRight />
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <h2>Productos Destacados</h2>
            <p className="section__subtitle">Lo más popular de nuestra tienda</p>
          </div>
          <Link to="/catalogo" className="section__link">Ver todos los productos →</Link>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid
            products={featured}
            categoriesById={categoriesById}
            emptyMessage="Todavía no hay productos destacados."
          />
        )}
      </section>

      {(loading || promos.length > 0) && (
        <section className="section section--offers">
          <div className="section__header">
            <div>
              <h2>Promociones</h2>
              <p className="section__subtitle">Aprovecha antes de que se acaben</p>
            </div>
            <Link to="/catalogo?promocion=true" className="section__link">Ver todas →</Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <ProductGrid products={promos} categoriesById={categoriesById} />
          )}
        </section>
      )}
    </div>
  );
}
