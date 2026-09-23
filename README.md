# Mi Tienda — Catálogo online con panel administrador

Tienda online construida con React + Vite, con carrito de compras (persistido en
localStorage), checkout por WhatsApp y un panel administrador protegido con Firebase
Authentication para gestionar productos, categorías y promociones desde el navegador,
sin tocar código.

## Stack

- React 19 + Vite + React Router
- Firebase Authentication (login del administrador)
- Firestore (productos, categorías)
- Cloudinary (imágenes de productos — plan gratuito, no requiere tarjeta)
- CSS propio (sin frameworks de pago)

> **Nota:** Firebase Storage requiere el plan de pago (Blaze) desde que Google cambió
> su política, incluso para uso gratuito. Por eso este proyecto usa **Cloudinary** para
> las imágenes en vez de Storage — Firestore y Authentication siguen siendo gratis con
> el plan Spark normal.

## 1. Configurar Firebase (Auth + Firestore)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. En **Compilación > Authentication**, habilita el proveedor **Correo electrónico/Contraseña**.
3. En **Authentication > Users**, crea manualmente el usuario administrador (correo y
   contraseña). No hay registro público: solo tú puedes crear administradores desde la
   consola de Firebase.
4. En **Compilación > Firestore Database**, crea la base de datos con **Database ID:
   `(default)`**, modo producción.
5. **Registra al administrador en Firestore (ANTES de publicar las reglas).** Copia su
   **UID** (Authentication > Users > columna "User UID"). En Firestore crea la colección
   `admins` y un documento cuyo **ID sea ese UID** (puede tener un campo cualquiera, ej.
   `activo: true`). Solo quien tenga ese documento es administrador.
6. En **Reglas** de Firestore, pega el contenido de [`firestore.rules`](firestore.rules)
   (lectura pública de lo activo, escritura solo del administrador) y publica.
   Opcional: en Authentication > Configuración > Acciones del usuario, desactiva
   "Permitir la creación de usuarios" para que nadie más pueda registrarse.
7. En **Configuración del proyecto > Tus apps**, crea una app web y copia las claves del
   SDK.

## 2. Configurar Cloudinary (imágenes de productos)

1. Crea una cuenta gratuita en [Cloudinary](https://cloudinary.com/users/register/free)
   (no pide tarjeta).
2. En el **Dashboard**, copia tu **Cloud name**.
3. Ve a **Settings (⚙️) > Upload > Upload presets > Add upload preset**, cambia
   **Signing Mode** a **Unsigned**, guarda y copia el nombre del preset.

## 3. Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_WHATSAPP_NUMBER=
```

`VITE_WHATSAPP_NUMBER` es el número que recibe los pedidos: código de país + número,
sin "+", espacios ni guiones (ej: `573001234567`).

`.env` nunca se sube a git (está en `.gitignore`).

## 4. Instalar y correr en desarrollo

```bash
npm install
npm run dev
```

Con Firestore vacío, entra a `/admin`, inicia sesión con el usuario que creaste en
Firebase, y en el Dashboard usa el botón **"Cargar datos de prueba"** para crear
categorías y productos de ejemplo (esto solo funciona si las colecciones están vacías).

## 5. Uso del panel administrador

Ruta: `/admin` (protegida — redirige a `/admin/login` si no hay sesión).

- **Dashboard**: resumen de productos, activos, en promoción, agotados y categorías.
- **Productos**: crear, editar, eliminar, activar/desactivar. Al crear/editar puedes subir
  la imagen (se guarda en Cloudinary y la URL en Firestore), definir precio normal y
  promocional (el % de descuento se calcula automáticamente), stock, y marcar
  "destacado" / "mostrar en carrusel".
- **Categorías**: crear, editar, activar/desactivar, eliminar (bloqueado si tiene
  productos asociados).
- **Promociones**: vista rápida de los productos en promoción y control de si aparecen
  en el carrusel o como destacados.

Cualquier cambio se refleja automáticamente en la tienda pública, sin tocar código.

## 6. Desplegar gratis (GitHub + Vercel)

1. Sube el repositorio a GitHub (`.env` no se sube, ya está ignorado).
2. En [Vercel](https://vercel.com), importa el repositorio.
3. Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
4. En **Environment Variables** de Vercel, agrega las mismas variables de tu `.env`
   (las de Firebase + las de Cloudinary + `VITE_WHATSAPP_NUMBER`).
5. Deploy. Cada push a la rama principal despliega automáticamente.
6. En Firebase > Authentication > Configuración > **Dominios autorizados**, agrega el
   dominio de Vercel (ej. `mi-tienda.vercel.app`) para que el login de /admin funcione.

## Estructura del proyecto

```text
src/
├── components/       Header, Footer, Cart, ProductCard, ProductGrid, PromoCarousel,
│                      CategoryFilter, SearchBar, WhatsAppFloatButton, ProtectedRoute,
│                      ConfirmDialog, ProductGridSkeleton
├── context/           CartContext (localStorage), AuthContext (Firebase Auth), ToastContext
├── services/          firebase.js, productService.js, categoryService.js,
│                      storageService.js, seedService.js
├── data/              store.js (nombre/tagline de la tienda), seedData.js (datos de prueba)
├── pages/             Home, Catalog, ProductDetail
│   └── admin/         AdminLogin, AdminLayout, Dashboard, ProductsAdmin, ProductForm,
│                      CategoriesAdmin, PromotionsAdmin, OrdersAdmin, SettingsAdmin
└── utils/             format.js (precios COP), whatsapp.js (mensaje + link), discount.js
```

## Modelo de datos (Firestore)

**products**
```js
{
  nombre, descripcion, descripcionCorta, categoriaId,
  precio, precioPromocion, enPromocion, descuento,
  imagen, stock, activo, destacado, mostrarEnCarrusel,
  createdAt, updatedAt
}
```

**categories**
```js
{ nombre, activo, createdAt, updatedAt }
```
