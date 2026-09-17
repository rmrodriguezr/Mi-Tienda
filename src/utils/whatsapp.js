import { formatPrice } from "./format";

// ⚠️ COLOCA AQUÍ TU NÚMERO DE WHATSAPP ⚠️
// Formato: código de país + número, sin "+", sin espacios ni guiones.
// Ejemplo para Colombia: 57 (código de país) + número de 10 dígitos.
// Ejemplo real (NO funcional, reemplázalo): "573001234567"
export const WHATSAPP_NUMBER = "573XXXXXXXXX";

// Construye el mensaje de pedido a partir de los items del carrito.
export function buildOrderMessage(items) {
  const lines = ["Hola, quiero realizar el siguiente pedido:", ""];

  items.forEach((item) => {
    lines.push(`🛍️ ${item.nombre}`);
    lines.push(`Cantidad: ${item.cantidad}`);
    lines.push(`Precio: ${formatPrice(item.precio)}`);
    lines.push("");
  });

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  lines.push(`Total: ${formatPrice(total)}`);
  lines.push("");
  lines.push("Quiero recibir información sobre disponibilidad, pago y envío.");

  return lines.join("\n");
}

// Genera el link de WhatsApp (wa.me) con el mensaje del pedido ya codificado.
export function buildWhatsAppLink(items) {
  const message = buildOrderMessage(items);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
