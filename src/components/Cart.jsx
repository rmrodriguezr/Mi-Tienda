import { useState } from "react";
import { Link } from "react-router-dom";
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../utils/format";
import { getEffectivePrice } from "../utils/pricing";
import { handleImageError } from "../utils/image";
import ConfirmDialog from "./ConfirmDialog";

export default function Cart() {
  const {
    items,
    increment,
    decrement,
    removeItem,
    clearCart,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const { showToast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  function handleIncrement(item) {
    if (item.cantidad >= item.stock) {
      showToast("Stock máximo alcanzado.", "error");
      return;
    }
    increment(item.id);
  }

  return (
    <>
      <div
        className={`cart-overlay ${isCartOpen ? "cart-overlay--visible" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside className={`cart-panel ${isCartOpen ? "cart-panel--open" : ""}`}>
        <div className="cart-panel__header">
          <h2>Tu carrito</h2>
          <button
            className="cart-panel__close"
            onClick={() => setIsCartOpen(false)}
            aria-label="Cerrar carrito"
          >
            <FiX size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-panel__empty">
            <span className="cart-page__empty-icon" style={{ fontSize: "2.5rem" }}>🛒</span>
            <p>Tu carrito está vacío.</p>
            <Link
              to="/catalogo"
              className="btn btn--primary"
              onClick={() => setIsCartOpen(false)}
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-panel__items">
              {items.map((item) => {
                const unitPrice = getEffectivePrice(item);
                return (
                  <div className="cart-item" key={item.id}>
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="cart-item__image"
                      width="64"
                      height="64"
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                    />
                    <div className="cart-item__info">
                      <p className="cart-item__name">{item.nombre}</p>
                      <p className="cart-item__price">
                        {item.enPromocion && item.precioPromocion < item.precio && (
                          <span className="product-card__price-old" style={{ marginRight: 6 }}>
                            {formatPrice(item.precio)}
                          </span>
                        )}
                        {formatPrice(unitPrice)}
                      </p>

                      <div className="cart-item__qty">
                        <button onClick={() => decrement(item.id)} aria-label="Disminuir cantidad">
                          <FiMinus size={14} />
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => handleIncrement(item)}
                          aria-label="Aumentar cantidad"
                          disabled={item.cantidad >= item.stock}
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      {item.cantidad >= item.stock && (
                        <span className="form-hint">Stock máximo alcanzado</span>
                      )}
                    </div>

                    <div className="cart-item__side">
                      <p className="cart-item__subtotal">
                        {formatPrice(unitPrice * item.cantidad)}
                      </p>
                      <button
                        className="cart-item__remove"
                        onClick={() => removeItem(item.id)}
                        aria-label="Eliminar producto"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-panel__footer">
              <button className="cart-panel__clear" onClick={() => setConfirmClear(true)}>
                Vaciar carrito
              </button>

              <div className="cart-panel__total">
                <span>Total productos</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <p className="shipping-note">
                🚚 El valor mostrado corresponde únicamente a los productos. El envío tiene un costo adicional, que será informado y confirmado antes de finalizar el pedido.
              </p>

              <Link
                to="/carrito"
                className="btn btn--whatsapp cart-panel__checkout"
                onClick={() => setIsCartOpen(false)}
              >
                <FiShoppingBag size={20} />
                Ver carrito y finalizar pedido
              </Link>
            </div>
          </>
        )}
      </aside>

      <ConfirmDialog
        open={confirmClear}
        title="Vaciar carrito"
        message="¿Seguro que deseas vaciar el carrito?"
        confirmLabel="Vaciar carrito"
        onConfirm={() => {
          clearCart();
          setConfirmClear(false);
          showToast("Carrito vaciado.", "success");
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
