import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { getActiveProducts } from "../services/productService";
import { getActiveCategories } from "../services/categoryService";
import { getEffectivePrice } from "../utils/pricing";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre A-Z" },
];

export default function Catalog() {
  useDocumentTitle("Catálogo");
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState(searchParams.get("buscar") || "");
  const [category, setCategory] = useState(searchParams.get("categoria") || null);
  const [onlyPromo, setOnlyPromo] = useState(searchParams.get("promocion") === "true");
  const [onlyDestacados, setOnlyDestacados] = useState(false);
  const [sortBy, setSortBy] = useState("relevancia");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    async function load() {
      try {
        const [prods, cats] = await Promise.all([
          getActiveProducts(),
          getActiveCategories(),
        ]);
        if (!active) return;
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error("Error cargando el catálogo:", err);
        if (active) {
          setError("No fue posible cargar el catálogo. Verifica tu conexión e intenta de nuevo.");
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

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = products.filter((product) => {
      const matchesQuery =
        !query ||
        product.nombre.toLowerCase().includes(query) ||
        (product.descripcion || "").toLowerCase().includes(query);

      const matchesCategory = !category || product.categoriaId === category;
      const matchesPromo = !onlyPromo || product.enPromocion;
      const matchesDestacado = !onlyDestacados || product.destacado;

      return matchesQuery && matchesCategory && matchesPromo && matchesDestacado;
    });

    if (sortBy === "precio-asc") {
      result = [...result].sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (sortBy === "precio-desc") {
      result = [...result].sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    } else if (sortBy === "nombre") {
      result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return result;
  }, [products, search, category, onlyPromo, onlyDestacados, sortBy]);

  return (
    <div className="catalog">
      <div className="catalog__header">
        <h1>Catálogo</h1>
        <p>Encuentra exactamente lo que buscas</p>
      </div>

      <div className="catalog__toolbar">
        <SearchBar value={search} onChange={setSearch} />

        <div className="catalog__checkboxes">
          <label>
            <input
              type="checkbox"
              checked={onlyPromo}
              onChange={(e) => setOnlyPromo(e.target.checked)}
            />
            Solo promociones
          </label>
          <label>
            <input
              type="checkbox"
              checked={onlyDestacados}
              onChange={(e) => setOnlyDestacados(e.target.checked)}
            />
            Solo destacados
          </label>
        </div>

        <select
          className="catalog__sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />

      {loading ? (
        <ProductGridSkeleton />
      ) : error ? (
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div className="public-error" style={{ marginBottom: "1rem" }}>{error}</div>
          <button className="btn btn--primary" onClick={() => setReloadToken((t) => t + 1)}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <p className="catalog__count">{filteredProducts.length} producto(s) encontrado(s)</p>
          <ProductGrid products={filteredProducts} categoriesById={categoriesById} />
        </>
      )}
    </div>
  );
}
