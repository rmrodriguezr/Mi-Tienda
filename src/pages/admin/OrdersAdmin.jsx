export default function OrdersAdmin() {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Pedidos</h1>
          <p>Próximamente</p>
        </div>
      </div>

      <div className="admin-empty">
        Los pedidos se coordinan por WhatsApp. Cuando quieras llevar un registro de pedidos
        dentro del panel, se puede agregar una colección "orders" en Firestore que se cree
        automáticamente al finalizar cada compra.
      </div>
    </div>
  );
}
