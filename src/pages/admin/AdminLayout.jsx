import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiTag,
  FiPercent,
  FiShoppingBag,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiExternalLink,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/productos", label: "Productos", icon: FiBox },
  { to: "/admin/categorias", label: "Categorías", icon: FiTag },
  { to: "/admin/promociones", label: "Promociones", icon: FiPercent },
  { to: "/admin/pedidos", label: "Pedidos", icon: FiShoppingBag },
  { to: "/admin/configuracion", label: "Configuración", icon: FiSettings },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const { storeName } = useSettings();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          {storeName}
          <span>Panel administrador</span>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <a
          className="admin-sidebar__preview"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiExternalLink size={18} /> Ver tienda
        </a>

        <button className="admin-sidebar__logout" onClick={handleLogout}>
          <FiLogOut size={18} /> Cerrar sesión
        </button>
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <button className="icon-btn" style={{ color: "#1a1a1a" }} onClick={() => setMobileNavOpen((v) => !v)}>
            <FiMenu size={20} />
          </button>
          <span style={{ fontWeight: 700 }}>{storeName} Admin</span>
          <a
            className="icon-btn"
            style={{ color: "#1a1a1a" }}
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver tienda"
          >
            <FiExternalLink size={18} />
          </a>
          <button className="icon-btn" style={{ color: "#1a1a1a" }} onClick={handleLogout}>
            <FiLogOut size={18} />
          </button>
        </div>

        {mobileNavOpen && (
          <nav className="admin-sidebar__nav" style={{ background: "#ffffff", padding: "1rem" }}>
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setMobileNavOpen(false)}>
                <Icon size={18} /> {label}
              </NavLink>
            ))}
          </nav>
        )}

        <Outlet />
      </div>
    </div>
  );
}
