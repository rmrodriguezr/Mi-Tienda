import { FiSearch } from "react-icons/fi";

export default function SearchBar({ value, onChange, placeholder = "Buscar productos..." }) {
  return (
    <div className="search-bar">
      <FiSearch className="search-bar__icon" />
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
