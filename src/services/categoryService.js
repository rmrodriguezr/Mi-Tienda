// Acceso a la colección "categories" de Firestore.
// Estructura del documento: { nombre, descripcion, activo, createdAt, updatedAt }
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { cached, invalidateCache } from "./cache";

const categoriesRef = collection(db, "categories");

function mapDoc(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getAllCategories() {
  const snapshot = await getDocs(query(categoriesRef, orderBy("nombre")));
  return snapshot.docs.map(mapDoc);
}

export function getActiveCategories() {
  return cached("categories:active", async () => {
    const snapshot = await getDocs(query(categoriesRef, where("activo", "==", true)));
    return snapshot.docs.map(mapDoc).sort((a, b) => a.nombre.localeCompare(b.nombre));
  });
}

export async function createCategory(data) {
  const docRef = await addDoc(categoriesRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  invalidateCache();
  return docRef.id;
}

export async function updateCategory(id, data) {
  await updateDoc(doc(db, "categories", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  invalidateCache();
}

export async function deleteCategory(id) {
  await deleteDoc(doc(db, "categories", id));
  invalidateCache();
}

export async function toggleCategoryActive(id, activo) {
  await updateDoc(doc(db, "categories", id), { activo, updatedAt: serverTimestamp() });
  invalidateCache();
}
