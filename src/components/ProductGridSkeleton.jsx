export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid--skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div className="product-card-skeleton" key={i}>
          <div className="skeleton product-card-skeleton__image" />
          <div className="product-card-skeleton__body">
            <div className="skeleton product-card-skeleton__line" style={{ width: "40%" }} />
            <div className="skeleton product-card-skeleton__line" style={{ width: "80%" }} />
            <div className="skeleton product-card-skeleton__line" style={{ width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
