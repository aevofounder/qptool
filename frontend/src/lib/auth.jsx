import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // On load, if a token exists, validate it via /auth/me/.
  useEffect(() => {
    let alive = true;
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    api
      .me()
      .then((u) => alive && setUser(u))
      .catch(() => {
        tokenStore.clear();
      })
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const login = async (username, password) => {
    await api.login(username, password);
    const u = await api.me();
    setUser(u);
    return u;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, isAuthed: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
