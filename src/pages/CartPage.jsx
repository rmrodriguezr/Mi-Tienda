import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../utils/format";
import { getEffectivePrice } from "../utils/pricing";
import { handleImageError } from "../utils/image";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { COLOMBIA_DEPARTMENTS, DEPARTMENT_NAMES } from "../data/colombia";
import {
  CUSTOMER_FIELDS,
  EMPTY_CUSTOMER,
  validateCustomer,
  validateCustomerField,
} from "../utils/customerValidation";
import { useSettings } from "../context/SettingsContext";
import ConfirmDialog from "../components/ConfirmDialog";

const SHIPPING_NOTE =
  "🚚 El valor mostrado corresponde únicamente a los productos. El envío tiene un costo adicional, que será informado y confirmado antes de finalizar el pedido.";

export default function CartPage() {
  useDocumentTitle("Mi carrito");
  const { items, increment, decrement, removeItem, clearCart, totalPrice } = useCart();
  const { showToast } = useToast();
  const { whatsappNumber, storeName } = useSettings();

  const [confirmClear, setConfirmClear] = useState(false);
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  function clearError(field) {
    setErrors((prev) => {
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function updateCustomerField(field, value) {
    setCustomer((prev) => {
      const next = { ...prev, [field]: value };
      // Al cambiar de departamento, la ciudad escrita antes deja de corresponder.
      if (field === "department") next.city = "";
      return next;
    });
    if (errors[field]) clearError(field);
  }

  function handleBlur(field) {
    const message = validateCustomerField(field, customer[field]);
    if (message) setErrors((prev) => ({ ...prev, [field]: message }));
    else clearError(field);
  }

  function fieldProps(field) {
    return {
      id: `customer-${field}`,
      value: customer[field],
      onChange: (e) => updateCustomerField(field, e.target.value),
      onBlur: () => handleBlur(field),
      "aria-invalid": errors[field] ? "true" : undefined,
      "aria-describedby": errors[field] ? `customer-${field}-error` : undefined,
      className: errors[field] ? "input--error" : undefined,
    };
  }

  function renderError(field) {
    return errors[field] ? (
      <span className="form-error" id={`customer-${field}-error`} role="alert">
        {errors[field]}
      </span>
    ) : null;
  }

  function handleIncrement(item) {
    if (item.cantidad >= item.stock) {
      showToast("Stock máximo alcanzado.", "error");
      return;
    }
    increment(item.id);
  }

  function handleSendOrder(e) {
    e.preventDefault();
    if (sending) return;
    const nextErrors = validateCustomer(customer);
    setErrors(nextErrors);
    const firstInvalid = CUSTOMER_FIELDS.find((field) => nextErrors[field]);
    if (firstInvalid) {
      showToast("Revisa los datos marcados en rojo para enviar el pedido.", "error");
      document.getElementById(`customer-${firstInvalid}`)?.focus();
      return;
    }
    setSending(true);
    const link = buildWhatsAppLink(items, customer, whatsappNumber, storeName);
    window.open(link, "_blank", "noopener,noreferrer");
    setTimeout(() => setSending(false), 1500);
  }

  if (items.length === 0) {
    return (
      <div className="cart-page cart-page--empty">
        <span className="cart-page__empty-icon">🛒</span>
        <h1>Tu carrito está vacío</h1>
        <p>Agrega productos desde el catálogo para armar tu pedido.</p>
        <Link to="/catalogo" className="btn btn--primary">Ver productos</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Mi carrito</h1>

      <div className="cart-page__layout">
        <div className="cart-page__items">
          {items.map((item) => {
            const unitPrice = getEffectivePrice(item);
            return (
              <div className="cart-page__item" key={item.id}>
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="cart-page__item-image"
                  width="80"
                  height="80"
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                />

                <div className="cart-page__item-info">
                  <p className="cart-page__item-name">{item.nombre}</p>
                  <div className="cart-page__item-price">
                    {item.enPromocion && item.precioPromocion < item.precio && (
                      <span className="product-card__price-old">{formatPrice(item.precio)}</span>
                    )}
                    <span>{formatPrice(unitPrice)}</span>
                  </div>

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

                <div className="cart-page__item-side">
                  <p className="cart-page__item-subtotal">{formatPrice(unitPrice * item.cantidad)}</p>
                  <button
                    className="btn btn--outline"
                    onClick={() => {
                      removeItem(item.id);
                      showToast(`${item.nombre} eliminado del carrito.`, "success");
                    }}
                  >
                    <FiTrash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}

          <button className="cart-panel__clear" onClick={() => setConfirmClear(true)}>
            Vaciar carrito
          </button>
        </div>

        <form className="cart-page__summary" onSubmit={handleSendOrder} noValidate>
          <div className="admin-card">
            <h3 style={{ marginBottom: "1rem" }}>Datos del cliente</h3>

            <div className="form-field">
              <label htmlFor="customer-name">Nombre completo *</label>
              <input type="text" autoComplete="name" {...fieldProps("name")} />
              {renderError("name")}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="customer-phone">Teléfono / WhatsApp *</label>
                <input type="tel" inputMode="tel" autoComplete="tel" {...fieldProps("phone")} />
                {renderError("phone")}
              </div>

              <div className="form-field">
                <label htmlFor="customer-email">Correo electrónico *</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@correo.com"
                  {...fieldProps("email")}
                />
                {renderError("email")}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="customer-department">Departamento *</label>
                <select autoComplete="address-level1" {...fieldProps("department")}>
                  <option value="">Selecciona tu departamento</option>
                  {DEPARTMENT_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                {renderError("department")}
              </div>

              <div className="form-field">
                <label htmlFor="customer-city">Ciudad / Municipio *</label>
                <input
                  type="text"
                  list="customer-city-options"
                  autoComplete="address-level2"
                  placeholder="Escribe tu ciudad"
                  {...fieldProps("city")}
                />
                <datalist id="customer-city-options">
                  {(COLOMBIA_DEPARTMENTS[customer.department] || []).map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
                {renderError("city")}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="customer-address">Dirección de entrega *</label>
              <input type="text" autoComplete="street-address" {...fieldProps("address")} />
              {renderError("address")}
            </div>

            <div className="form-field">
              <label htmlFor="customer-notes">Observaciones (opcional)</label>
              <textarea
                id="customer-notes"
                value={customer.notes}
                onChange={(e) => updateCustomerField("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="admin-card" style={{ marginTop: "1.25rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Resumen del pedido</h3>

            <div className="order-summary__items">
              <div className="order-summary__line order-summary__line--head">
                <span>Producto</span>
                <span>Cant.</span>
                <span>Precio</span>
              </div>
              {items.map((item) => (
                <div className="order-summary__line" key={item.id}>
                  <span>{item.nombre}</span>
                  <span>{item.cantidad}</span>
                  <span>{formatPrice(getEffectivePrice(item) * item.cantidad)}</span>
                </div>
              ))}
            </div>

            <div className="cart-page__summary-row">
              <span>Subtotal productos</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="cart-page__summary-row">
              <span>Envío</span>
              <span>Por confirmar</span>
            </div>
            <div className="cart-page__summary-row cart-page__summary-row--total">
              <span>Total productos</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <p className="shipping-note">{SHIPPING_NOTE}</p>

            <button type="submit" className="btn btn--whatsapp" style={{ width: "100%" }} disabled={sending}>
              <FaWhatsapp size={20} /> {sending ? "Enviando..." : "Enviar pedido por WhatsApp"}
            </button>
          </div>
        </form>
      </div>

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
    </div>
  );
}
