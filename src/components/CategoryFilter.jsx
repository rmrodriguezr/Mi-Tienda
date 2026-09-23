export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="category-filter">
      <button
        className={`category-filter__chip ${!selected ? "category-filter__chip--active" : ""}`}
        onClick={() => onSelect(null)}
      >
        Todas
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-filter__chip ${selected === category.id ? "category-filter__chip--active" : ""}`}
          onClick={() => onSelect(category.id)}
        >
          {category.nombre}
        </button>
      ))}
    </div>
  );
}
