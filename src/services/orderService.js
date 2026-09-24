// Acceso a la colección "orders" de Firestore.
// Se crea un documento por cada pedido enviado desde /carrito, con los datos del
// cliente y los productos elegidos. El administrador los gestiona en /admin/pedidos.
//
// Estructura del documento:
// { customer: { name, phone, email, department, city, address, notes },
//   items: [{ id, nombre, cantidad, precioUnitario, subtotal }],
//   totalProductos, estado: "pendiente" | "venta" | "declinado",
//   entregado: boolean, createdAt, updatedAt }
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const ordersRef = collection(db, "orders");

function mapDoc(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

// Se llama desde el checkout público (/carrito), sin necesidad de sesión: las reglas
// de Firestore solo permiten crear pedidos con estado "pendiente" y entregado en false.
export async function createOrder(customer, items, totalProductos) {
  const orderItems = items.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: item.subtotal,
  }));

  const docRef = await addDoc(ordersRef, {
    customer,
    items: orderItems,
    totalProductos,
    estado: "pendiente",
    entregado: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Todos los pedidos (uso administrativo), del más reciente al más antiguo. Se filtra
// entre activos/entregados en el navegador en lugar de combinar un "where" con un
// "orderBy" en Firestore, que exigiría crear un índice compuesto en la consola.
export async function getAllOrders() {
  const snapshot = await getDocs(query(ordersRef, orderBy("createdAt", "desc")));
  return snapshot.docs.map(mapDoc);
}

// Marca el pedido como venta confirmada.
export async function markOrderAsSale(id) {
  await updateDoc(doc(db, "orders", id), { estado: "venta", updatedAt: serverTimestamp() });
}

// El cliente no siguió con la compra: el pedido se borra directamente, no queda
// esperando ninguna acción más.
export async function deleteOrder(id) {
  await deleteDoc(doc(db, "orders", id));
}

// Saca el pedido del listado activo (venta entregada).
export async function markOrderDelivered(id) {
  await updateDoc(doc(db, "orders", id), { entregado: true, updatedAt: serverTimestamp() });
}
