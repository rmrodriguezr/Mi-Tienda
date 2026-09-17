import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductGrid from "../components/ProductGrid";
import { PRODUCTS } from "../data/products";
import { CATEGORIES } from "../data/categories";
import { BANNER } from "../data/store";

export default function Home() {
  const destacados = PRODUCTS.filter((p) => p.destacado);
  const ofertas = PRODUCTS.filter((p) => p.oferta);
  const categoriasReales = CATEGORIES.filter((c) => c !== "Ofertas");

  return (
    <div className="home">
      <section className="banner">
        <div className="banner__content">
          <span className="banner__kicker">{BANNER.kicker}</span>
          <h1 className="banner__title">{BANNER.title}</h1>
          <p className="banner__subtitle">{BANNER.subtitle}</p>
          <Link to="/catalogo" className="btn btn--primary btn--lg">
            {BANNER.ctaText} <FiArrowRight />
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <h2>Categorías</h2>
            <p className="section__subtitle">Explora por lo que más te gusta</p>
          </div>
          <Link to="/catalogo" className="section__link">Ver todas →</Link>
        </div>

        <div className="category-grid">
          {categoriasReales.map((categoria) => (
            <Link
              key={categoria}
              to={`/catalogo?categoria=${encodeURIComponent(categoria)}`}
              className="category-card"
            >
              <span>{categoria}</span>
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

        <ProductGrid products={destacados} />
      </section>

      {ofertas.length > 0 && (
        <section className="section section--offers">
          <div className="section__header">
            <div>
              <h2>Ofertas</h2>
              <p className="section__subtitle">Aprovecha antes de que se acaben</p>
            </div>
            <Link to="/catalogo?oferta=true" className="section__link">Ver todas las ofertas →</Link>
          </div>

          <ProductGrid products={ofertas} />
        </section>
      )}
    </div>
  );
}
