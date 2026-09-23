import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  categoriesById = {},
  emptyMessage = "No se encontraron productos.",
}) {
  if (products.length === 0) {
    return <p className="product-grid__empty">{emptyMessage}</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoriesById[product.categoriaId]}
        />
      ))}
    </div>
  );
}
