import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// Solo deja pasar a administradores verificados (ver admins/{uid} en firestore.rules).
// - Sin sesión: va al login.
// - Con sesión pero sin ser administrador: se cierra la sesión y se devuelve a la tienda.
export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const { showToast } = useToast();
  const rejected = !loading && Boolean(user) && !isAdmin;

  useEffect(() => {
    if (!rejected) return;
    showToast("Acceso denegado: esta cuenta no es administradora.", "error");
    logout();
  }, [rejected, showToast, logout]);

  if (loading) {
    return <div className="admin-loading">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
