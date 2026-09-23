// Configuración e inicialización de Firebase (app + Firestore).
// Todas las claves se leen desde variables de entorno (.env), nunca hardcodeadas.
// Copia .env.example a .env y completa los valores de tu proyecto de Firebase
// (Consola de Firebase > Configuración del proyecto > Tus apps > SDK config).
//
// Authentication vive en ./auth.js y solo se carga con el panel /admin, para que la
// tienda pública no descargue código de autenticación que no usa.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

if (!firebaseReady) {
  console.warn(
    "[Firebase] Faltan variables de entorno. Copia .env.example a .env, completa tus " +
      "credenciales de Firebase y reinicia `npm run dev`. Mientras tanto, la tienda pública " +
      "se muestra vacía y el panel /admin no funcionará."
  );
}

// Si no hay configuración real, usamos un proyecto "demo-*" válido para el SDK de
// Firebase (no existe en la nube) solo para que initializeApp no lance una excepción
// que rompa toda la app. Las llamadas a Firestore/Auth seguirán fallando de forma
// controlada hasta que completes tu .env.
const app = initializeApp(
  firebaseReady ? firebaseConfig : { ...firebaseConfig, apiKey: "demo-api-key", projectId: "demo-project" }
);

export const db = getFirestore(app);
export default app;
