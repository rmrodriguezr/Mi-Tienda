import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import ProductGrid from "../components/ProductGrid";
import { PRODUCTS } from "../data/products";

export default function Catalog() {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("buscar") || "");
  const [category, setCategory] = useState(searchParams.get("categoria") || null);
  const [onlyOfertas, setOnlyOfertas] = useState(searchParams.get("oferta") === "true");
  const [onlyDestacados, setOnlyDestacados] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return PRODUCTS.filter((product) => {
      const matchesQuery =
        !query ||
        product.nombre.toLowerCase().includes(query) ||
        product.descripcion.toLowerCase().includes(query) ||
        product.categoria.toLowerCase().includes(query);

      let matchesCategory = true;
      if (category === "Ofertas") {
        matchesCategory = product.oferta;
      } else if (category) {
        matchesCategory = product.categoria === category;
      }

      const matchesOferta = !onlyOfertas || product.oferta;
      const matchesDestacado = !onlyDestacados || product.destacado;

      return matchesQuery && matchesCategory && matchesOferta && matchesDestacado;
    });
  }, [search, category, onlyOfertas, onlyDestacados]);

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
              checked={onlyOfertas}
              onChange={(e) => setOnlyOfertas(e.target.checked)}
            />
            Solo ofertas
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
      </div>

      <CategoryFilter selected={category} onSelect={setCategory} />

      <p className="catalog__count">{filteredProducts.length} producto(s) encontrado(s)</p>

      <ProductGrid products={filteredProducts} />
    </div>
  );
}
