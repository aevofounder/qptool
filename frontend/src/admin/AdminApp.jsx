import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import AdminLayout from "./AdminLayout.jsx";
import Login from "./Login.jsx";
import ImagesPage from "./ImagesPage.jsx";
import CatalogsPage from "./CatalogsPage.jsx";
import SettingsPage from "./SettingsPage.jsx";
import "./admin.css";

function RequireAuth({ children }) {
  const { ready, isAuthed } = useAuth();
  if (!ready) return <div className="admin__loading mono">Загрузка…</div>;
  if (!isAuthed) return <Navigate to="/manage/login" replace />;
  return children;
}

export default function AdminApp() {
  const { ready, isAuthed } = useAuth();

  return (
    <Routes>
      <Route
        path="/manage/login"
        element={ready && isAuthed ? <Navigate to="/manage" replace /> : <Login />}
      />
      <Route
        path="/manage"
        element={
          <RequireAuth>
            <AdminLayout>
              <ImagesPage />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/manage/catalogs"
        element={
          <RequireAuth>
            <AdminLayout>
              <CatalogsPage />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/manage/settings"
        element={
          <RequireAuth>
            <AdminLayout>
              <SettingsPage />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/manage" replace />} />
    </Routes>
  );
}
