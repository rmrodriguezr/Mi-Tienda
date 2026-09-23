import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, checkIsAdmin } from "../services/auth";

const AuthContext = createContext(null);

export const NOT_ADMIN = "not-admin";

// Estado de sesión del panel administrativo. Solo se monta en las rutas /admin.
// Una sesión iniciada NO basta: además hay que ser administrador (admins/{uid}).
export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    isAdmin: false,
    loading: Boolean(auth),
  });

  useEffect(() => {
    if (!auth) return undefined;
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const isAdmin = firebaseUser ? await checkIsAdmin(firebaseUser.uid) : false;
      if (active) setState({ user: firebaseUser, isAdmin, loading: false });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function login(email, password) {
    if (!auth) {
      throw new Error(
        "Firebase no está configurado. Completa las credenciales en tu archivo .env."
      );
    }
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    if (!(await checkIsAdmin(user.uid))) {
      await signOut(auth);
      const error = new Error("Esta cuenta no tiene permisos de administrador.");
      error.code = NOT_ADMIN;
      throw error;
    }
  }

  async function logout() {
    if (!auth) return;
    await signOut(auth);
  }

  const value = {
    ...state,
    login,
    logout,
    isAuthenticated: Boolean(state.user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
