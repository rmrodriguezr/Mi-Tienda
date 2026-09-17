import { FaWhatsapp } from "react-icons/fa";
import { WHATSAPP_NUMBER } from "../utils/whatsapp";

export default function WhatsAppFloatButton() {
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola, tengo una pregunta sobre sus productos."
  )}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Escríbenos por WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
