import { formatPrice } from "./format";
import { getEffectivePrice } from "./pricing";
import { STORE_NAME } from "../data/store";

// Número de respaldo, definido en .env como VITE_WHATSAPP_NUMBER. Se usa mientras
// carga la configuración de Firestore o si el administrador no configuró uno ahí.
// Formato: código de país + número, sin "+", sin espacios ni guiones (ej: 573001234567).
export const DEFAULT_WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "";

// Construye el mensaje de pedido a partir de los items del carrito y los datos del
// cliente (name, phone, email, department, city, address, notes). Usa el formato de
// WhatsApp: *negrita*.
export function buildOrderMessage(items, customer = null, storeName = STORE_NAME) {
  const lines = [`🛍️ *NUEVO PEDIDO — ${storeName}*`, "", "Hola 👋, quiero realizar el siguiente pedido:", ""];

  let total = 0;
  lines.push("📦 *Productos*");
  items.forEach((item, index) => {
    const unitPrice = getEffectivePrice(item);
    total += unitPrice * item.cantidad;
    if (index > 0) lines.push("");
    lines.push(`• ${item.nombre}`);
    lines.push(`Cantidad: ${item.cantidad}`);
    lines.push(`Precio unitario: ${formatPrice(unitPrice)}`);
  });

  lines.push("");
  lines.push(`💰 *Total productos: ${formatPrice(total)}*`);

  if (customer) {
    lines.push("");
    lines.push("👤 *Datos del cliente*");
    lines.push(`• Nombre: ${customer.name}`);
    lines.push(`• Teléfono: ${customer.phone}`);
    lines.push(`• Departamento: ${customer.department}`);
    lines.push(`• Ciudad: ${customer.city}`);
    lines.push(`• Dirección: ${customer.address}`);
    lines.push(`• Correo: ${customer.email}`);
    if (customer.notes) lines.push(`• Observaciones: ${customer.notes}`);
  }

  lines.push("");
  lines.push(
    "🚚 *Costo de envío:* El valor del envío depende de la ciudad y departamento de destino. El costo será confirmado posteriormente por este mismo medio."
  );
  lines.push("");
  lines.push(
    "Quiero confirmar la disponibilidad del producto y recibir información sobre el medio de pago y el valor total de mi pedido, incluido el envío."
  );
  lines.push("");
  lines.push("¡Gracias! 😊");

  return lines.join("\n");
}

// Genera el link de WhatsApp (wa.me) con el mensaje del pedido ya codificado.
export function buildWhatsAppLink(
  items,
  customer = null,
  whatsappNumber = DEFAULT_WHATSAPP_NUMBER,
  storeName = STORE_NAME
) {
  const message = buildOrderMessage(items, customer, storeName);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
