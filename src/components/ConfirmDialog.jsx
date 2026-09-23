export default function ConfirmDialog({
  open,
  title = "¿Estás seguro?",
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button className="btn btn--outline" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
