import { FiX, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import { buildWhatsAppLink } from "../utils/whatsapp";

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

  function handleCheckout() {
    const link = buildWhatsAppLink(items);
    window.open(link, "_blank", "noopener,noreferrer");
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
          <p className="cart-panel__empty">Tu carrito está vacío.</p>
        ) : (
          <>
            <div className="cart-panel__items">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.imagen} alt={item.nombre} className="cart-item__image" />
                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.nombre}</p>
                    <p className="cart-item__price">{formatPrice(item.precio)}</p>

                    <div className="cart-item__qty">
                      <button onClick={() => decrement(item.id)} aria-label="Disminuir cantidad">
                        <FiMinus size={14} />
                      </button>
                      <span>{item.cantidad}</span>
                      <button
                        onClick={() => increment(item.id)}
                        aria-label="Aumentar cantidad"
                        disabled={item.cantidad >= item.stock}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-item__side">
                    <p className="cart-item__subtotal">
                      {formatPrice(item.precio * item.cantidad)}
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
              ))}
            </div>

            <div className="cart-panel__footer">
              <button className="cart-panel__clear" onClick={clearCart}>
                Vaciar carrito
              </button>

              <div className="cart-panel__total">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <button className="btn btn--whatsapp cart-panel__checkout" onClick={handleCheckout}>
                <FaWhatsapp size={20} />
                Comprar por WhatsApp
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
