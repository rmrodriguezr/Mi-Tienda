import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Página no encontrada");
  return (
    <div className="not-found">
      <span className="not-found__code">404</span>
      <h1>Página no encontrada</h1>
      <p>La página que buscas no existe o fue movida.</p>
      <Link to="/" className="btn btn--primary">Volver al inicio</Link>
    </div>
  );
}
