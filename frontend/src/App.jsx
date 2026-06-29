import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { SettingsProvider } from "./lib/hooks.jsx";
import { AuthProvider } from "./lib/auth.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import Catalogs from "./pages/Catalogs.jsx";
import Product from "./pages/Product.jsx";
import Solution from "./pages/Solution.jsx";
import About from "./pages/About.jsx";
import Contacts from "./pages/Contacts.jsx";
import AdminApp from "./admin/AdminApp.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();

  // The admin panel is a self-contained area without the public chrome.
  if (pathname.startsWith("/manage")) {
    return (
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    );
  }

  return (
    <SettingsProvider>
      <div className="app">
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalogs" element={<Catalogs />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/solutions" element={<Solution />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
      </div>
    </SettingsProvider>
  );
}
