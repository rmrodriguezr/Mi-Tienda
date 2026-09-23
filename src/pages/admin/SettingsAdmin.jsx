import { useEffect, useState } from "react";
import { useSettings } from "../../context/SettingsContext";
import { useToast } from "../../context/ToastContext";

export default function SettingsAdmin() {
  const { storeName, storeTagline, whatsappNumber, loading, updateSettings } = useSettings();
  const { showToast } = useToast();

  const [form, setForm] = useState({ storeName: "", storeTagline: "", whatsappNumber: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) setForm({ storeName, storeTagline, whatsappNumber });
  }, [loading, storeName, storeTagline, whatsappNumber]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        storeName: form.storeName.trim(),
        storeTagline: form.storeTagline.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
      });
      showToast("✓ Configuración guardada", "success");
    } catch (err) {
      console.error("Error guardando la configuración:", err);
      const message =
        err.code === "permission-denied"
          ? "Sin permiso para guardar: publica las reglas de firestore.rules en Firebase Console (Firestore Database > Reglas)."
          : "No se pudo guardar la configuración.";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Configuración</h1>
          <p>Datos generales de la tienda</p>
        </div>
      </div>

      <form className="admin-card" onSubmit={handleSave}>
        <div className="form-field">
          <label>Nombre de la tienda</label>
          <input
            type="text"
            value={form.storeName}
            onChange={(e) => updateField("storeName", e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-field">
          <label>Eslogan</label>
          <input
            type="text"
            value={form.storeTagline}
            onChange={(e) => updateField("storeTagline", e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-field">
          <label>Número de WhatsApp</label>
          <input
            type="text"
            value={form.whatsappNumber}
            onChange={(e) => updateField("whatsappNumber", e.target.value)}
            placeholder="Ej: 573001234567"
            disabled={loading}
          />
          <span className="form-hint">
            Código de país + número, sin "+", espacios ni guiones (ej: 573001234567). Se usa
            para el botón flotante y para enviar el pedido por WhatsApp al finalizar la compra.
          </span>
        </div>

        <button type="submit" className="btn btn--primary" disabled={loading || saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
