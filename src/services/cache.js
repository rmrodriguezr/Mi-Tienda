// Caché en memoria (por pestaña) para las consultas públicas a Firestore.
// Evita repetir las mismas lecturas al navegar entre Inicio, Catálogo y Detalle.
// Se vacía sola a los 5 minutos, al recargar la página y cada vez que el administrador
// crea, edita o elimina algo (ver invalidateCache).
const TTL_MS = 5 * 60 * 1000;
const entries = new Map();

export function cached(key, loader) {
  const hit = entries.get(key);
  if (hit && Date.now() - hit.time < TTL_MS) return hit.promise;

  const promise = loader().catch((err) => {
    // Un error no debe quedar guardado: el siguiente intento vuelve a consultar.
    entries.delete(key);
    throw err;
  });
  entries.set(key, { promise, time: Date.now() });
  return promise;
}

export function invalidateCache() {
  entries.clear();
}
