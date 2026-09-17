import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "mi-tienda-cart";

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addToCart(product, cantidad = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const maxStock = product.stock;

      if (existing) {
        const nextCantidad = Math.min(existing.cantidad + cantidad, maxStock);
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: nextCantidad } : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen,
          stock: product.stock,
          cantidad: Math.min(cantidad, maxStock),
        },
      ];
    });
    setIsCartOpen(true);
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
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );

  const value = {
    items,
    addToCart,
    increment,
    decrement,
    removeItem,
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
