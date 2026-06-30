import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";

/**
 * Inquiry list ("спецификация") — a lightweight B2B quote basket.
 * Collects products the user wants a price for, persists to localStorage,
 * and is sent together with the contact-form lead.
 *
 * An item is { code, name, slug } — enough to identify it in the lead.
 */
const KEY = "qptool_inquiry";
const InquiryContext = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
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
    if (!item || !item.code) return;
    setItems((cur) => (cur.some((i) => i.code === item.code)
      ? cur
      : [...cur, { code: item.code, name: item.name || item.code, slug: item.slug || "" }]));
  }, []);

  const remove = useCallback((code) => {
    setItems((cur) => cur.filter((i) => i.code !== code));
  }, []);

  const toggle = useCallback((item) => {
    if (!item || !item.code) return;
    setItems((cur) => (cur.some((i) => i.code === item.code)
      ? cur.filter((i) => i.code !== item.code)
      : [...cur, { code: item.code, name: item.name || item.code, slug: item.slug || "" }]));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.length, has, add, remove, toggle, clear }),
    [items, has, add, remove, toggle, clear]
  );

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used within <InquiryProvider>");
  return ctx;
}
