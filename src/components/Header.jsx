import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { totalItems, setIsCartOpen } = useCart();
  const { storeName, storeTagline } = useSettings();
  const navigate = useNavigate();

  function handleSearchSubmit(e) {
    e.preventDefault();
    navigate(`/catalogo?buscar=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  }

  return (
    <header className="header">
      <div className="header__row">
        <Link to="/" className="header__logo" onClick={() => setMenuOpen(false)}>
          <span className="header__logo-name">{storeName}</span>
          <span className="header__logo-tagline">{storeTagline}</span>
        </Link>

        <form className="header__search" onSubmit={handleSearchSubmit}>
          <SearchBar value={search} onChange={setSearch} />
        </form>

        <div className="header__actions">
          <button
            className="header__cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir carrito"
          >
            <FiShoppingCart size={22} />
            {totalItems > 0 && <span className="header__cart-badge">{totalItems}</span>}
          </button>

          <button
            className="header__menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      <nav className={`header__nav ${menuOpen ? "header__nav--open" : ""}`}>
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>Inicio</NavLink>
        <NavLink to="/catalogo" onClick={() => setMenuOpen(false)}>Catálogo</NavLink>
        <Link to="/catalogo?promocion=true" onClick={() => setMenuOpen(false)}>Promociones</Link>
      </nav>
    </header>
  );
}
