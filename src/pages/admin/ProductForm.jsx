import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../services/productService";
import { getActiveCategories } from "../../services/categoryService";
import { optimizeImage, formatBytes } from "../../utils/imageOptimizer";
import { calculateDiscount } from "../../utils/discount";
import { formatPrice } from "../../utils/format";
import { handleImageError } from "../../utils/image";
import { useToast } from "../../context/ToastContext";

// Límite del archivo ORIGINAL, solo como red de seguridad (evita que un archivo
// absurdamente grande congele el navegador). La imagen se optimiza igual después.
const MAX_ORIGINAL_SIZE = 25 * 1024 * 1024; // 25MB

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  descripcionCorta: "",
  categoriaId: "",
  precio: "",
  precioPromocion: "",
  enPromocion: false,
  imagen: "",
  stock: "",
  activo: true,
  destacado: false,
  mostrarEnCarrusel: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState("");
  const [imageInfo, setImageInfo] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    async function load() {
      const cats = await getActiveCategories();
      setCategories(cats);

      if (isEditing) {
        const product = await getProductById(id, { fresh: true });
        if (product) {
          setForm({
            nombre: product.nombre || "",
            descripcion: product.descripcion || "",
            descripcionCorta: product.descripcionCorta || "",
            categoriaId: product.categoriaId || "",
            precio: product.precio ?? "",
            precioPromocion: product.precioPromocion ?? "",
            enPromocion: Boolean(product.enPromocion),
            imagen: product.imagen || "",
            stock: product.stock ?? "",
            activo: product.activo ?? true,
            destacado: Boolean(product.destacado),
            mostrarEnCarrusel: Boolean(product.mostrarEnCarrusel),
          });
          setImagePreview(product.imagen || "");
        }
        setLoading(false);
      }
    }
    load();
  }, [id, isEditing]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo si hay error

    if (!file) {
      showToast("No se seleccionó ninguna imagen.", "error");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("El archivo debe ser una imagen (JPG, PNG o WebP).", "error");
      return;
    }

    if (file.size > MAX_ORIGINAL_SIZE) {
      showToast("La imagen es demasiado grande (máximo 25 MB).", "error");
      return;
    }

    setOptimizing(true);
    setImageInfo(null);
    try {
      const result = await optimizeImage(file);
      setImagePreview(result.base64);
      updateField("imagen", result.base64);
      setImageInfo({
        originalSizeBytes: result.originalSizeBytes,
        sizeBytes: result.sizeBytes,
        width: result.width,
        height: result.height,
        type: result.type,
      });
      showToast("✓ Imagen optimizada correctamente.", "success");
    } catch (err) {
      console.error("Error optimizando la imagen:", err);
      showToast(err.message || "No se pudo procesar la imagen.", "error");
    } finally {
      setOptimizing(false);
    }
  }

  const discountPreview =
    form.enPromocion && form.precio && form.precioPromocion
      ? calculateDiscount(Number(form.precio), Number(form.precioPromocion))
      : 0;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nombre.trim()) {
      showToast("El nombre del producto es obligatorio.", "error");
      return;
    }

    if (!form.categoriaId) {
      showToast("Selecciona una categoría válida.", "error");
      return;
    }

    const precioNum = Number(form.precio);
    if (!form.precio || Number.isNaN(precioNum) || precioNum <= 0) {
      showToast("El precio normal es obligatorio y debe ser mayor que 0.", "error");
      return;
    }

    if (form.enPromocion) {
      const promoNum = Number(form.precioPromocion);
      if (!form.precioPromocion || Number.isNaN(promoNum) || promoNum <= 0) {
        showToast("El precio de promoción es obligatorio cuando la promoción está activa.", "error");
        return;
      }
      if (promoNum >= precioNum) {
        showToast("El precio de promoción debe ser menor que el precio normal.", "error");
        return;
      }
    }

    const stockNum = Number(form.stock);
    if (form.stock !== "" && (!Number.isInteger(stockNum) || stockNum < 0)) {
      showToast("El stock debe ser un número entero igual o mayor que 0.", "error");
      return;
    }

    if (!form.imagen) {
      showToast("Debes subir una imagen del producto.", "error");
      return;
    }

    if (optimizing) {
      showToast("Espera a que termine de optimizarse la imagen.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        descripcionCorta: form.descripcionCorta.trim(),
        categoriaId: form.categoriaId,
        precio: Number(form.precio),
        precioPromocion: form.enPromocion ? Number(form.precioPromocion) : null,
        enPromocion: form.enPromocion,
        imagen: form.imagen,
        stock: Number(form.stock) || 0,
        activo: form.activo,
        destacado: form.destacado,
        mostrarEnCarrusel: form.mostrarEnCarrusel,
      };

      if (isEditing) {
        await updateProduct(id, payload);
        showToast("Producto actualizado correctamente.", "success");
      } else {
        await createProduct(payload);
        showToast("Producto creado correctamente.", "success");
      }
      navigate("/admin/productos");
    } catch (err) {
      console.error(err);
      const message = String(err?.message || "");
      if (message.toLowerCase().includes("longer than") || message.toLowerCase().includes("exceeds")) {
        showToast(
          "El producto no se pudo guardar: el documento superó el límite de tamaño de Firestore (1 MB). Usa una imagen menos pesada.",
          "error"
        );
      } else {
        showToast("Ocurrió un error al guardar el producto en Firestore.", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="admin-page"><p>Cargando producto...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>{isEditing ? "Editar producto" : "Agregar producto"}</h1>
          <p>Los cambios se reflejan automáticamente en la tienda pública.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-card">
        <h3 style={{ marginBottom: "1rem" }}>Información básica</h3>
        <div className="form-field">
          <label>Nombre del producto *</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Descripción corta</label>
          <input
            type="text"
            value={form.descripcionCorta}
            onChange={(e) => updateField("descripcionCorta", e.target.value)}
            placeholder="Se muestra en la tarjeta del producto"
          />
        </div>

        <div className="form-field">
          <label>Descripción completa</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => updateField("descripcion", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Categoría *</label>
          <select
            value={form.categoriaId}
            onChange={(e) => updateField("categoriaId", e.target.value)}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          {categories.length === 0 && (
            <span className="form-hint">No tienes categorías activas. Crea una primero en "Categorías".</span>
          )}
        </div>

        <h3 style={{ margin: "1.5rem 0 1rem" }}>Precio</h3>
        <div className="form-row">
          <div className="form-field">
            <label>Precio normal *</label>
            <input
              type="number"
              min="0"
              value={form.precio}
              onChange={(e) => updateField("precio", e.target.value)}
              required
            />
          </div>
          <div className="form-field form-field--checkbox" style={{ alignSelf: "center", marginTop: "1.4rem" }}>
            <input
              type="checkbox"
              id="enPromocion"
              checked={form.enPromocion}
              onChange={(e) => updateField("enPromocion", e.target.checked)}
            />
            <label htmlFor="enPromocion">¿Está en promoción?</label>
          </div>
        </div>

        {form.enPromocion && (
          <>
            <div className="form-field">
              <label>Precio promocional</label>
              <input
                type="number"
                min="0"
                value={form.precioPromocion}
                onChange={(e) => updateField("precioPromocion", e.target.value)}
              />
            </div>
            {discountPreview > 0 && (
              <span className="form-discount-preview">
                {discountPreview}% de descuento — {formatPrice(form.precioPromocion)}
              </span>
            )}
          </>
        )}

        <h3 style={{ margin: "1.5rem 0 1rem" }}>Imagen</h3>
        <div className="form-field">
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Vista previa" onError={handleImageError} />
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={optimizing}
          />
          <span className="form-hint">
            Se optimiza automáticamente en tu navegador (máx. 1200×1200, WebP) y se guarda
            como Base64 directamente en el producto.
          </span>

          {optimizing && (
            <div className="upload-progress">
              <div className="upload-progress__bar upload-progress__bar--indeterminate" />
              <span className="upload-progress__label">Optimizando imagen...</span>
            </div>
          )}

          {!optimizing && imageInfo && (
            <div className="image-optimized-info">
              <p>✓ Imagen optimizada</p>
              <span>Tamaño original: {formatBytes(imageInfo.originalSizeBytes)}</span>
              <span>Tamaño optimizado: {formatBytes(imageInfo.sizeBytes)}</span>
              <span>Dimensiones: {imageInfo.width} × {imageInfo.height}</span>
            </div>
          )}
        </div>

        <h3 style={{ margin: "1.5rem 0 1rem" }}>Inventario</h3>
        <div className="form-row">
          <div className="form-field">
            <label>Stock</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => updateField("stock", e.target.value)}
            />
          </div>
          <div className="form-field form-field--checkbox" style={{ alignSelf: "center", marginTop: "1.4rem" }}>
            <input
              type="checkbox"
              id="activo"
              checked={form.activo}
              onChange={(e) => updateField("activo", e.target.checked)}
            />
            <label htmlFor="activo">Producto activo</label>
          </div>
        </div>

        <h3 style={{ margin: "1.5rem 0 1rem" }}>Visibilidad</h3>
        <div className="form-field form-field--checkbox">
          <input
            type="checkbox"
            id="destacado"
            checked={form.destacado}
            onChange={(e) => updateField("destacado", e.target.checked)}
          />
          <label htmlFor="destacado">Producto destacado</label>
        </div>
        <div className="form-field form-field--checkbox">
          <input
            type="checkbox"
            id="mostrarEnCarrusel"
            checked={form.mostrarEnCarrusel}
            onChange={(e) => updateField("mostrarEnCarrusel", e.target.checked)}
          />
          <label htmlFor="mostrarEnCarrusel">Mostrar en carrusel</label>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="btn btn--outline" onClick={() => navigate("/admin/productos")}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving || optimizing}>
            {optimizing ? "Optimizando imagen..." : saving ? "Guardando..." : "Guardar producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
