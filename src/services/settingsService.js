// Acceso al documento único "settings/general" de Firestore, con la
// configuración general de la tienda (ej. número de WhatsApp para pedidos).
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const settingsDocRef = doc(db, "settings", "general");

export async function getSettings() {
  const snap = await getDoc(settingsDocRef);
  return snap.exists() ? snap.data() : {};
}

export async function updateSettings(data) {
  await setDoc(settingsDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
