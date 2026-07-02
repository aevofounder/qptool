import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { PageLoader } from "./components/States.jsx";
import { SettingsProvider } from "./lib/hooks.jsx";
import { InquiryProvider } from "./lib/inquiry.jsx";
import { AuthProvider } from "./lib/auth.jsx";
import { initAnalytics, trackPageview } from "./lib/analytics.js";

// Ленивая загрузка страниц — каждый маршрут попадает в свой чанк, поэтому
// первый экран грузит только то, что нужно. Тяжёлая админка вынесена в
// отдельный чанк и не тянется в публичный бандл.
const Home = lazy(() => import("./pages/Home.jsx"));
const Catalog = lazy(() => import("./pages/Catalog.jsx"));
const Catalogs = lazy(() => import("./pages/Catalogs.jsx"));
const Product = lazy(() => import("./pages/Product.jsx"));
const Solution = lazy(() => import("./pages/Solution.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contacts = lazy(() => import("./pages/Contacts.jsx"));
const Specification = lazy(() => import("./pages/Specification.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

// Сброс скролла + трекинг просмотра страницы при каждой смене маршрута.
function RouteEffects() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageview(pathname + search);
  }, [pathname, search]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();

  // Инициализация аналитики один раз на старте (грузит счётчики, только если
  // заданы их ID в env — иначе no-op).
  useEffect(() => {
    initAnalytics();
  }, []);

  // Админ-панель — самодостаточная зона без публичной обвязки.
  if (pathname.startsWith("/manage")) {
    return (
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <AdminApp />
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    );
  }

  return (
    <SettingsProvider>
      <InquiryProvider>
        <div className="app">
          <a href="#main-content" className="skip-link">
            Перейти к содержимому
          </a>
          <RouteEffects />
          <Header />
          <main id="main-content">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalogs" element={<Catalogs />} />
                  <Route path="/product/:slug" element={<Product />} />
                  <Route path="/solutions" element={<Solution />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/specification" element={<Specification />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </InquiryProvider>
    </SettingsProvider>
  );
}
