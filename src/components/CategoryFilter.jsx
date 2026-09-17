import { CATEGORIES } from "../data/categories";

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="category-filter">
      <button
        className={`category-filter__chip ${!selected ? "category-filter__chip--active" : ""}`}
        onClick={() => onSelect(null)}
      >
        Todas
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          className={`category-filter__chip ${selected === category ? "category-filter__chip--active" : ""}`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
