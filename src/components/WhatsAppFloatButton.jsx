import { FaWhatsapp } from "react-icons/fa";
import { useSettings } from "../context/SettingsContext";

export default function WhatsAppFloatButton() {
  const { whatsappNumber } = useSettings();
  const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
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
