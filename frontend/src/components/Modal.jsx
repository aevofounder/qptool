import { useEffect, useRef } from "react";

/**
 * Доступная модалка: role=dialog + aria-modal, закрытие по Escape и клику по
 * фону, блокировка скролла body, ловушка фокуса (Tab не уходит за пределы) и
 * возврат фокуса на элемент, вызвавший открытие.
 *
 * Переиспользуется для любых оверлеев (просмотр PDF, будущие диалоги).
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, iframe, [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, label, children, className = "" }) {
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!open) return;

    lastFocused.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Начальный фокус — на панель.
    const panel = panelRef.current;
    panel?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Ловушка фокуса.
      const nodes = panel?.querySelectorAll(FOCUSABLE);
      if (!nodes || nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      // Возврат фокуса вызывающему элементу.
      if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`viewer ${className}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="viewer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={label || title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
