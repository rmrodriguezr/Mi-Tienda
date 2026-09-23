import { createContext, useContext, useEffect, useState } from "react";
import { getEffectivePrice } from "../utils/pricing";

const CartContext = createContext(null);
const STORAGE_KEY = "mi-tienda-cart";

// Valida que un item recuperado de localStorage tenga la forma mínima esperada.
// Cualquier item corrupto o incompleto se descarta en vez de romper el carrito.
function isValidCartItem(item) {
  return (
    item &&
    typeof item === "object" &&
    (typeof item.id === "string" || typeof item.id === "number") &&
    typeof item.nombre === "string" &&
    typeof item.precio === "number" &&
    typeof item.stock === "number" &&
    typeof item.cantidad === "number" &&
    item.cantidad > 0
  );
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Carrito guardado con formato inválido");

    return parsed.filter(isValidCartItem);
  } catch (err) {
    console.warn("[Carrito] Datos de localStorage inválidos, se reinicia el carrito:", err);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Si localStorage no está disponible (modo privado, etc.), no hay nada más que hacer.
    }
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("[Carrito] No se pudo guardar en localStorage:", err);
    }
  }, [items]);

  // Agrega un producto al carrito. Si ya existe, suma la cantidad en vez de
  // crear una línea duplicada. Devuelve si la cantidad quedó topada por el stock.
  function addToCart(product, cantidad = 1) {
    let cappedByStock = false;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const maxStock = product.stock;

      if (existing) {
        const wanted = existing.cantidad + cantidad;
        cappedByStock = wanted > maxStock;
        const nextCantidad = Math.min(wanted, maxStock);
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: nextCantidad, stock: maxStock } : item
        );
      }

      cappedByStock = cantidad > maxStock;
      return [
        ...prev,
        {
          id: product.id,
          nombre: product.nombre,
          imagen: product.imagen,
          precio: product.precio,
          precioPromocion: product.precioPromocion ?? null,
          enPromocion: Boolean(product.enPromocion),
          stock: maxStock,
          cantidad: Math.min(cantidad, maxStock),
        },
      ];
    });
    setIsCartOpen(true);
    return { cappedByStock };
  }

  // Fija la cantidad exacta de un item (input directo), acotada entre 1 y el
  // stock disponible. cantidad <= 0 elimina el producto del carrito.
  function updateQuantity(id, cantidad) {
    setItems((prev) => {
      if (cantidad <= 0) return prev.filter((item) => item.id !== id);
      return prev.map((item) =>
        item.id === id ? { ...item, cantidad: Math.min(cantidad, item.stock) } : item
      );
    });
  }

  function increment(id) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.min(item.cantidad + 1, item.stock) }
          : item
      )
    );
  }

  function decrement(id) {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + getEffectivePrice(item) * item.cantidad,
    0
  );

  const value = {
    items,
    addToCart,
    updateQuantity,
    increment,
    decrement,
    removeItem,
    removeFromCart: removeItem,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
