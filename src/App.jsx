import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import WhatsAppFloatButton from "./components/WhatsAppFloatButton";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <Cart />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
          </Routes>
        </main>

        <Footer />
        <WhatsAppFloatButton />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
