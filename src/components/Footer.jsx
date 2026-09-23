import { Link } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { useSettings } from "../context/SettingsContext";

export default function Footer() {
  const { storeName } = useSettings();
  return (
    <footer className="footer">
      <div className="footer__content">
        <div>
          <p className="footer__brand">{storeName}</p>
          <p className="footer__copy">© {new Date().getFullYear()} {storeName}. Todos los derechos reservados.</p>
        </div>

        <nav className="footer__links">
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/catalogo?promocion=true">Promociones</Link>
          <Link to="/admin/login" className="footer__admin-link">
            <FiLock size={13} /> Administrador
          </Link>
        </nav>
      </div>
    </footer>
  );
}
