// Acceso a la colección "products" de Firestore.
// Estructura del documento:
// { nombre, descripcion, descripcionCorta, categoriaId, precio, precioPromocion,
//   enPromocion, descuento, imagen, stock, activo, destacado, mostrarEnCarrusel,
//   createdAt, updatedAt }
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { calculateDiscount } from "../utils/discount";
import { cached, invalidateCache } from "./cache";

const productsRef = collection(db, "products");

function mapDoc(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

// Todos los productos (uso administrativo: incluye activos e inactivos).
export async function getAllProducts() {
  const snapshot = await getDocs(query(productsRef, orderBy("createdAt", "desc")));
  return snapshot.docs.map(mapDoc);
}

// Productos activos, para la tienda pública. Una sola consulta (con caché) alimenta
// Inicio (destacados, promociones, carrusel), Catálogo y Detalle; los filtros se hacen
// en el navegador en lugar de lanzar una consulta a Firestore por cada sección.
export function getActiveProducts() {
  return cached("products:active", async () => {
    const snapshot = await getDocs(query(productsRef, where("activo", "==", true)));
    return snapshot.docs.map(mapDoc);
  });
}

// { fresh: true } (panel admin) ignora la caché para editar siempre los datos reales.
export async function getProductById(id, { fresh = false } = {}) {
  // Si el producto ya está en la caché de la tienda no hace falta otra lectura.
  if (!fresh) {
    const known = await getActiveProducts().catch(() => null);
    const fromCache = known?.find((p) => p.id === id);
    if (fromCache) return fromCache;
  }

  try {
    const snap = await getDoc(doc(db, "products", id));
    return snap.exists() ? mapDoc(snap) : null;
  } catch (err) {
    // Las reglas de Firestore ocultan los productos inactivos a los visitantes.
    if (err.code === "permission-denied") return null;
    throw err;
  }
}

export async function createProduct(data) {
  const descuento = data.enPromocion
    ? calculateDiscount(data.precio, data.precioPromocion)
    : 0;

  const docRef = await addDoc(productsRef, {
    ...data,
    descuento,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  invalidateCache();
  return docRef.id;
}

export async function updateProduct(id, data) {
  const descuento = data.enPromocion
    ? calculateDiscount(data.precio, data.precioPromocion)
    : 0;

  await updateDoc(doc(db, "products", id), {
    ...data,
    descuento,
    updatedAt: serverTimestamp(),
  });
  invalidateCache();
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
  invalidateCache();
}

export async function toggleProductActive(id, activo) {
  await updateDoc(doc(db, "products", id), { activo, updatedAt: serverTimestamp() });
  invalidateCache();
}
