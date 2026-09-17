import { Link } from "react-router-dom";
import { STORE_NAME } from "../data/store";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div>
          <p className="footer__brand">{STORE_NAME}</p>
          <p className="footer__copy">© {new Date().getFullYear()} {STORE_NAME}. Todos los derechos reservados.</p>
        </div>

        <nav className="footer__links">
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/catalogo?oferta=true">Ofertas</Link>
        </nav>
      </div>
    </footer>
  );
}
