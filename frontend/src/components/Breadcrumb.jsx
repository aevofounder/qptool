import { useNavigate } from "react-router-dom";

/**
 * Mono breadcrumb. `items` is an array of { label, to? } — the last item
 * (or any without `to`) renders as the current (non-clickable) crumb.
 */
export default function Breadcrumb({ items }) {
  const navigate = useNavigate();
  return (
    <nav className="crumb" aria-label="Хлебные крошки">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i}>
            {item.to ? (
              <button type="button" className="crumb__link" onClick={() => navigate(item.to)}>
                {item.label}
              </button>
            ) : (
              <span className="cur" aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            )}
            {!isLast ? " / " : ""}
          </span>
        );
      })}
    </nav>
  );
}
