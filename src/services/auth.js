// Firebase Authentication. Solo lo importa el panel /admin (cargado con lazy loading).
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import app, { db } from "./firebase";

export let auth = null;
try {
  auth = getAuth(app);
} catch (err) {
  console.warn("[Firebase] No se pudo inicializar Authentication:", err.message);
}

// Un usuario es administrador si existe el documento admins/{uid} en Firestore.
// Las reglas de Firestore solo permiten a cada usuario leer SU propio documento y
// prohíben escribir en esa colección desde la app; el documento se crea a mano en la
// consola de Firebase. Esta comprobación solo decide qué pantalla mostrar: la
// seguridad real la imponen las reglas de Firestore en cada escritura.
export async function checkIsAdmin(uid) {
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, "admins", uid));
    return snap.exists();
  } catch (err) {
    console.error("No se pudo verificar el rol de administrador:", err);
    return false;
  }
}
