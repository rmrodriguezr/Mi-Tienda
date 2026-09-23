import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { SettingsProvider } from "./context/SettingsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import WhatsAppFloatButton from "./components/WhatsAppFloatButton";
import Home from "./pages/Home";

// La portada se carga de inmediato; el resto de páginas y TODO el panel /admin se
// descargan solo cuando se visitan.
const Catalog = lazy(() => import("./pages/Catalog"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CartPage = lazy(() => import("./pages/CartPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const AdminRoot = lazy(() => import("./pages/admin/AdminRoot"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProductsAdmin = lazy(() => import("./pages/admin/ProductsAdmin"));
const ProductForm = lazy(() => import("./pages/admin/ProductForm"));
const CategoriesAdmin = lazy(() => import("./pages/admin/CategoriesAdmin"));
const PromotionsAdmin = lazy(() => import("./pages/admin/PromotionsAdmin"));
const OrdersAdmin = lazy(() => import("./pages/admin/OrdersAdmin"));
const SettingsAdmin = lazy(() => import("./pages/admin/SettingsAdmin"));

const pageFallback = <div className="admin-loading">Cargando...</div>;

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <Cart />
      <main className="main-content">
        <Suspense fallback={pageFallback}>{children}</Suspense>
      </main>
      <Footer />
      <WhatsAppFloatButton />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <SettingsProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/catalogo" element={<PublicLayout><Catalog /></PublicLayout>} />
                <Route path="/producto/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
                <Route path="/carrito" element={<PublicLayout><CartPage /></PublicLayout>} />
                {/* El checkout vive dentro de /carrito; estos alias evitan enlaces rotos. */}
                <Route path="/checkout" element={<Navigate to="/carrito" replace />} />
                <Route path="/promociones" element={<Navigate to="/catalogo?promocion=true" replace />} />

                {/* Panel administrativo: AuthProvider solo existe dentro de AdminRoot. */}
                <Route
                  path="/admin"
                  element={
                    <Suspense fallback={pageFallback}>
                      <AdminRoot />
                    </Suspense>
                  }
                >
                  <Route
                    path="login"
                    element={
                      <Suspense fallback={pageFallback}>
                        <AdminLogin />
                      </Suspense>
                    }
                  />
                  <Route
                    element={
                      <Suspense fallback={pageFallback}>
                        <ProtectedRoute>
                          <AdminLayout />
                        </ProtectedRoute>
                      </Suspense>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="productos" element={<ProductsAdmin />} />
                    <Route path="productos/nuevo" element={<ProductForm />} />
                    <Route path="productos/:id" element={<ProductForm />} />
                    <Route path="categorias" element={<CategoriesAdmin />} />
                    <Route path="promociones" element={<PromotionsAdmin />} />
                    <Route path="pedidos" element={<OrdersAdmin />} />
                    <Route path="configuracion" element={<SettingsAdmin />} />
                  </Route>
                </Route>

                <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
              </Routes>
            </CartProvider>
          </SettingsProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
