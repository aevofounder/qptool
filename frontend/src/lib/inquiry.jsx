import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";

/**
 * Inquiry list ("спецификация") — a lightweight B2B quote basket.
 * Collects products the user wants a price for, persists to localStorage,
 * and is sent together with the contact-form lead.
 *
 * An item is { code, name, slug, qty } — enough to identify it in the lead and
 * carry the requested quantity.
 */
const KEY = "qptool_inquiry";
const InquiryContext = createContext(null);

// Russian plural picker: pluralRu(2, ["позиция","позиции","позиций"]) → "позиции".
export function pluralRu(n, forms) {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}

// Coerce anything loaded/added into a well-formed item with a positive integer qty.
function normalizeItem(raw) {
  if (!raw || !raw.code) return null;
  const qty = Math.max(1, Math.floor(Number(raw.qty) || 1));
  return {
    code: String(raw.code),
    name: raw.name || String(raw.code),
    slug: raw.slug || "",
    qty,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(normalizeItem).filter(Boolean) : [];
  } catch {
    return [];
  }
}

/**
 * Build the human-readable specification text — "красиво по абзацам":
 * a numbered list where every position is its own paragraph.
 */
export function buildSpecText(items) {
  if (!items || !items.length) return "";
  const header =
    `Спецификация — ${items.length} ` +
    pluralRu(items.length, ["позиция", "позиции", "позиций"]) + ":";
  const blocks = items.map((it, i) => {
    const lines = [`${i + 1}. ${it.name}`, `   Артикул: ${it.code}`, `   Количество: ${it.qty} шт.`];
    return lines.join("\n");
  });
  return header + "\n\n" + blocks.join("\n\n");
}

/**
 * Compose the full message sent with the lead: the specification text plus an
 * optional buyer comment, separated into clean paragraphs.
 */
export function buildInquiryMessage(items, comment) {
  const spec = buildSpecText(items);
  const note = (comment || "").trim();
  return [spec, note ? "Комментарий покупателя:\n" + note : ""]
    .filter(Boolean)
    .join("\n\n");
}

export function InquiryProvider({ children }) {
  const [items, setItems] = useState(load);

  // Persist on every change (only ever writes our own key).
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [items]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY) setItems(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((code) => items.some((i) => i.code === code), [items]);

  const add = useCallback((item) => {
    const next = normalizeItem(item);
    if (!next) return;
    setItems((cur) => (cur.some((i) => i.code === next.code) ? cur : [...cur, next]));
  }, []);

  const remove = useCallback((code) => {
    setItems((cur) => cur.filter((i) => i.code !== code));
  }, []);

  const toggle = useCallback((item) => {
    const next = normalizeItem(item);
    if (!next) return;
    setItems((cur) => (cur.some((i) => i.code === next.code)
      ? cur.filter((i) => i.code !== next.code)
      : [...cur, next]));
  }, []);

  const setQty = useCallback((code, qty) => {
    const q = Math.max(1, Math.floor(Number(qty) || 1));
    setItems((cur) => cur.map((i) => (i.code === code ? { ...i, qty: q } : i)));
  }, []);

  const increment = useCallback((code) => {
    setItems((cur) => cur.map((i) => (i.code === code ? { ...i, qty: i.qty + 1 } : i)));
  }, []);

  const decrement = useCallback((code) => {
    setItems((cur) =>
      cur.map((i) => (i.code === code ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      totalQty: items.reduce((sum, i) => sum + i.qty, 0),
      has,
      add,
      remove,
      toggle,
      setQty,
      increment,
      decrement,
      clear,
    }),
    [items, has, add, remove, toggle, setQty, increment, decrement, clear]
  );

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used within <InquiryProvider>");
  return ctx;
}
