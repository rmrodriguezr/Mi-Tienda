import { Outlet } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";

// Raíz de todas las rutas /admin. Se carga con lazy loading, así que Firebase
// Authentication solo se descarga cuando alguien entra al panel, nunca en la tienda.
export default function AdminRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
