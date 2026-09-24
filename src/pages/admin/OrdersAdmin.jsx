import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiCheckCircle, FiPhone, FiTrash2, FiX } from "react-icons/fi";
import {
  getAllOrders,
  markOrderAsSale,
  deleteOrder,
  markOrderDelivered,
} from "../../services/orderService";
import { formatPrice } from "../../utils/format";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

const STATUS_LABELS = {
  pendiente: "Pendiente",
  venta: "Venta",
  declinado: "Declinado",
};

const STATUS_CLASSES = {
  pendiente: "status-pill--inactive",
  venta: "status-pill--active",
  declinado: "status-pill--out",
};

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "—";
  return timestamp.toDate().toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Mensaje de error legible según la causa más probable, en lugar de un genérico.
function describeError(err) {
  if (err?.code === "permission-denied") {
    return 'No tienes permiso para ver los pedidos. Verifica que tu cuenta esté registrada en la colección "admins" de Firestore y que las reglas de Firestore estén publicadas.';
  }
  if (err?.code === "failed-precondition") {
    return "Firestore necesita crear un índice para esta consulta. Abre la consola del navegador (F12): el error de Firebase trae un enlace para crearlo con un clic.";
  }
  return "No fue posible cargar los pedidos. Verifica tu conexión y la configuración de Firebase.";
}

export default function OrdersAdmin() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("activos"); // "activos" | "entregados"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [toDeliver, setToDeliver] = useState(null);
  const [toDecline, setToDecline] = useState(null);
  const [toRemove, setToRemove] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeOrders = useMemo(() => orders.filter((o) => !o.entregado), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => o.entregado), [orders]);
  const visibleOrders = tab === "activos" ? activeOrders : deliveredOrders;

  async function handleMarkAsSale(order) {
    setBusyId(order.id);
    try {
      await markOrderAsSale(order.id);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, estado: "venta" } : o))
      );
      showToast('Pedido marcado como "Venta".', "success");
    } catch (err) {
      console.error(err);
      showToast("No se pudo actualizar el pedido.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline() {
    if (!toDecline) return;
    setBusyId(toDecline.id);
    try {
      await deleteOrder(toDecline.id);
      setOrders((prev) => prev.filter((o) => o.id !== toDecline.id));
      showToast("Pedido declinado y eliminado.", "success");
    } catch (err) {
      console.error(err);
      showToast("No se pudo eliminar el pedido.", "error");
    } finally {
      setBusyId(null);
      setToDecline(null);
    }
  }

  async function handleRemove() {
    if (!toRemove) return;
    setBusyId(toRemove.id);
    try {
      await deleteOrder(toRemove.id);
      setOrders((prev) => prev.filter((o) => o.id !== toRemove.id));
      showToast("Pedido eliminado del historial.", "success");
    } catch (err) {
      console.error(err);
      showToast("No se pudo eliminar el pedido.", "error");
    } finally {
      setBusyId(null);
      setToRemove(null);
    }
  }

  async function handleMarkDelivered() {
    if (!toDeliver) return;
    setBusyId(toDeliver.id);
    try {
      await markOrderDelivered(toDeliver.id);
      setOrders((prev) =>
        prev.map((o) => (o.id === toDeliver.id ? { ...o, entregado: true } : o))
      );
      showToast("Pedido marcado como entregado.", "success");
    } catch (err) {
      console.error(err);
      showToast("No se pudo marcar el pedido como entregado.", "error");
    } finally {
      setBusyId(null);
      setToDeliver(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Pedidos</h1>
          <p>Pedidos enviados desde el carrito de la tienda</p>
        </div>
      </div>

      <div className="admin-tabs" style={{ marginBottom: "1.25rem" }}>
        <button
          className={`admin-tabs__item ${tab === "activos" ? "admin-tabs__item--active" : ""}`}
          onClick={() => setTab("activos")}
        >
          Activos {activeOrders.length > 0 && `(${activeOrders.length})`}
        </button>
        <button
          className={`admin-tabs__item ${tab === "entregados" ? "admin-tabs__item--active" : ""}`}
          onClick={() => setTab("entregados")}
        >
          Entregados
        </button>
      </div>

      {loading ? (
        <p>Cargando pedidos...</p>
      ) : error ? (
        <div className="admin-login__error">
          {error}{" "}
          <button className="btn btn--outline" style={{ marginLeft: "0.75rem" }} onClick={loadData}>
            Reintentar
          </button>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="admin-empty">
          {tab === "activos"
            ? "No hay pedidos pendientes por ahora. Aparecerán aquí en cuanto un cliente compre desde el carrito."
            : "Todavía no hay pedidos marcados como entregados."}
        </div>
      ) : (
        <div className="order-list">
          {visibleOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card__header">
                <div>
                  <span className={`status-pill ${STATUS_CLASSES[order.estado] || "status-pill--inactive"}`}>
                    {STATUS_LABELS[order.estado] || order.estado}
                  </span>
                  <span className="order-card__date">{formatDate(order.createdAt)}</span>
                </div>
                <span className="order-card__total">{formatPrice(order.totalProductos)}</span>
              </div>

              <div className="order-card__body">
                <div className="order-card__customer">
                  <p className="order-card__customer-name">{order.customer?.name}</p>
                  <p>
                    <FiPhone size={13} /> {order.customer?.phone}
                  </p>
                  <p>{order.customer?.email}</p>
                  <p>
                    {order.customer?.address}, {order.customer?.city}, {order.customer?.department}
                  </p>
                  {order.customer?.notes && <p>Obs.: {order.customer.notes}</p>}
                </div>

                <ul className="order-card__items">
                  {order.items?.map((item, index) => (
                    <li key={`${item.id}-${index}`}>
                      <span>{item.nombre} × {item.cantidad}</span>
                      <span>{formatPrice(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-card__actions">
                {order.estado === "pendiente" && (
                  <>
                    <button
                      className="btn btn--primary"
                      disabled={busyId === order.id}
                      onClick={() => handleMarkAsSale(order)}
                    >
                      <FiCheck size={15} /> Marcar como venta
                    </button>
                    <button
                      className="btn btn--outline"
                      disabled={busyId === order.id}
                      onClick={() => setToDecline(order)}
                    >
                      <FiX size={15} /> Marcar como declinado
                    </button>
                  </>
                )}

                {tab === "activos" && order.estado !== "pendiente" && (
                  <button
                    className="btn btn--secondary"
                    disabled={busyId === order.id}
                    onClick={() => setToDeliver(order)}
                  >
                    <FiCheckCircle size={15} /> Marcar como entregado
                  </button>
                )}

                {tab === "entregados" && (
                  <button
                    className="btn btn--outline"
                    disabled={busyId === order.id}
                    onClick={() => setToRemove(order)}
                  >
                    <FiTrash2 size={15} /> Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDeliver)}
        title="Marcar como entregado"
        message="El pedido saldrá de la lista de pedidos activos y pasará al historial de entregados. ¿Continuar?"
        confirmLabel="Marcar como entregado"
        onConfirm={handleMarkDelivered}
        onCancel={() => setToDeliver(null)}
      />

      <ConfirmDialog
        open={Boolean(toDecline)}
        title="Declinar pedido"
        message="El pedido se eliminará por completo y no quedará registrado. Esta acción no se puede deshacer. ¿Continuar?"
        confirmLabel="Declinar y eliminar"
        onConfirm={handleDecline}
        onCancel={() => setToDecline(null)}
      />

      <ConfirmDialog
        open={Boolean(toRemove)}
        title="Eliminar pedido"
        message="Se eliminará por completo del historial de entregados. Esta acción no se puede deshacer. ¿Continuar?"
        confirmLabel="Eliminar"
        onConfirm={handleRemove}
        onCancel={() => setToRemove(null)}
      />
    </div>
  );
}
