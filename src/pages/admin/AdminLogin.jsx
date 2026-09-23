import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { NOT_ADMIN, useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { firebaseReady } from "../../services/firebase";
import { useSettings } from "../../context/SettingsContext";

export default function AdminLogin() {
  const { user, isAdmin, login } = useAuth();
  const { showToast } = useToast();
  const { storeName } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      if (err.code === NOT_ADMIN) {
        // Cuenta válida en Firebase pero sin permisos: fuera del panel, de vuelta a la tienda.
        showToast("Acceso denegado: esta cuenta no es administradora.", "error");
        navigate("/", { replace: true });
        return;
      }
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1>{storeName} · Admin</h1>
        <p>Inicia sesión para administrar tu tienda.</p>

        {!firebaseReady && (
          <div className="admin-login__error">
            Firebase no está configurado todavía. Copia <code>.env.example</code> a{" "}
            <code>.env</code>, completa tus credenciales del proyecto de Firebase y
            reinicia <code>npm run dev</code>.
          </div>
        )}

        {error && <div className="admin-login__error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
