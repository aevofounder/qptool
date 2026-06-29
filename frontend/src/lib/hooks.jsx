import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";
import { FALLBACK_SETTINGS } from "./fallback.js";

/**
 * useFetch — run an async loader on mount (and when `deps` change).
 * Returns { data, loading, error }. On error, `fallback` is used as data.
 */
export function useFetch(loader, deps = [], fallback = null) {
  const [state, setState] = useState({ data: fallback, loading: true, error: null });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(loader)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: fallback, loading: false, error }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

// ---- site settings (contacts/branding) shared by header + footer ---------
const SettingsContext = createContext(FALLBACK_SETTINGS);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  useEffect(() => {
    let alive = true;
    api
      .settings()
      .then((data) => alive && data && setSettings({ ...FALLBACK_SETTINGS, ...data }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
