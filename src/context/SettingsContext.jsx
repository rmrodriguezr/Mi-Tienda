import { createContext, useContext, useEffect, useState } from "react";
import { getSettings, updateSettings as saveSettings } from "../services/settingsService";
import { STORE_NAME, STORE_TAGLINE } from "../data/store";
import { DEFAULT_WHATSAPP_NUMBER } from "../utils/whatsapp";

const SettingsContext = createContext(null);

const DEFAULTS = {
  storeName: STORE_NAME,
  storeTagline: STORE_TAGLINE,
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSettings()
      .then((saved) => {
        if (!active) return;
        setSettings({
          storeName: saved.storeName || DEFAULTS.storeName,
          storeTagline: saved.storeTagline || DEFAULTS.storeTagline,
          whatsappNumber: saved.whatsappNumber || DEFAULTS.whatsappNumber,
        });
      })
      .catch((err) => {
        console.warn("[Configuración] No se pudo cargar la configuración de la tienda:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function updateSettings(data) {
    await saveSettings(data);
    setSettings((prev) => ({ ...prev, ...data }));
  }

  const value = { ...settings, loading, updateSettings };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings debe usarse dentro de un SettingsProvider");
  }
  return context;
}
