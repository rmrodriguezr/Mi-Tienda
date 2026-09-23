import { useEffect } from "react";
import { useSettings } from "../context/SettingsContext";

// Actualiza <title> por página. Ej: useDocumentTitle("Catálogo") -> "Catálogo | Mi Tienda"
export function useDocumentTitle(pageTitle) {
  const { storeName } = useSettings();
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${storeName}` : storeName;
  }, [pageTitle, storeName]);
}
