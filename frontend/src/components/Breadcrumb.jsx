import { useNavigate } from "react-router-dom";

/**
 * Mono breadcrumb. `items` is an array of { label, to? } — the last item
 * (or any without `to`) renders as the current (non-clickable) crumb.
 */
export default function Breadcrumb({ items }) {
  const navigate = useNavigate();
  return (
    <div className="crumb">
      {items.map((item, i) => (
        <span key={i}>
          {item.to ? (
            <button type="button" className="crumb__link" onClick={() => navigate(item.to)}>
              {item.label}
            </button>
          ) : (
            <span className="cur">{item.label}</span>
          )}
          {i < items.length - 1 ? " / " : ""}
        </span>
      ))}
    </div>
  );
}
