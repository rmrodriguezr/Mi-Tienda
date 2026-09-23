// Datos de prueba, solo para desarrollo. Se cargan manualmente desde el
// Dashboard del admin ("Cargar datos de prueba") cuando Firestore está vacío.
// No se insertan automáticamente en producción.

export const SEED_CATEGORIES = [
  { nombre: "Belleza", activo: true },
  { nombre: "Hogar", activo: true },
  { nombre: "Ropa", activo: true },
  { nombre: "Accesorios", activo: true },
  { nombre: "Tecnología", activo: true },
  { nombre: "Otros", activo: true },
];

// categoriaNombre se resuelve a categoriaId al momento de sembrar los datos.
export const SEED_PRODUCTS = [
  {
    nombre: "Perfume Floral",
    descripcion:
      "Fragancia femenina de larga duración con notas florales y cítricas, presentación de 50 ml. Ideal para el día a día.",
    descripcionCorta: "Perfume de 50 ml",
    categoriaNombre: "Belleza",
    precio: 89900,
    precioPromocion: 69900,
    enPromocion: true,
    imagen: "https://picsum.photos/seed/perfume-floral/600/600",
    stock: 10,
    activo: true,
    destacado: true,
    mostrarEnCarrusel: true,
  },
  {
    nombre: "Crema Hidratante Facial",
    descripcion:
      "Crema hidratante con ácido hialurónico para todo tipo de piel, uso diario mañana y noche.",
    descripcionCorta: "Hidratación profunda 24h",
    categoriaNombre: "Belleza",
    precio: 32900,
    precioPromocion: null,
    enPromocion: false,
    imagen: "https://picsum.photos/seed/crema-facial/600/600",
    stock: 22,
    activo: true,
    destacado: false,
    mostrarEnCarrusel: false,
  },
  {
    nombre: "Bolso Casual",
    descripcion:
      "Bolso elegante en cuero sintético, amplio espacio interno y acabados resistentes.",
    descripcionCorta: "Cuero sintético premium",
    categoriaNombre: "Accesorios",
    precio: 79900,
    precioPromocion: null,
    enPromocion: false,
    imagen: "https://picsum.photos/seed/bolso-casual/600/600",
    stock: 12,
    activo: true,
    destacado: true,
    mostrarEnCarrusel: false,
  },
  {
    nombre: "Audífonos Bluetooth",
    descripcion:
      "Audífonos bluetooth con estuche de carga, sonido envolvente y hasta 20 horas de batería.",
    descripcionCorta: "20h de batería",
    categoriaNombre: "Tecnología",
    precio: 89900,
    precioPromocion: 69900,
    enPromocion: true,
    imagen: "https://picsum.photos/seed/audifonos/600/600",
    stock: 15,
    activo: true,
    destacado: true,
    mostrarEnCarrusel: true,
  },
  {
    nombre: "Organizador para Hogar",
    descripcion:
      "Organizador multiusos con compartimentos, ideal para closet, cocina o baño.",
    descripcionCorta: "Multiusos con compartimentos",
    categoriaNombre: "Hogar",
    precio: 39900,
    precioPromocion: 29900,
    enPromocion: true,
    imagen: "https://picsum.photos/seed/organizador/600/600",
    stock: 20,
    activo: true,
    destacado: false,
    mostrarEnCarrusel: true,
  },
];
