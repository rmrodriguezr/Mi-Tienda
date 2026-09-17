import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { STORE_NAME, STORE_TAGLINE } from "../data/store";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { totalItems, setIsCartOpen } = useCart();
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
          <span className="header__logo-name">{STORE_NAME}</span>
          <span className="header__logo-tagline">{STORE_TAGLINE}</span>
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
        <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
        <Link to="/catalogo" onClick={() => setMenuOpen(false)}>Catálogo</Link>
        <Link to="/catalogo?oferta=true" onClick={() => setMenuOpen(false)}>Ofertas</Link>
      </nav>
    </header>
  );
}
