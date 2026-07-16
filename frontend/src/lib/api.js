// Thin fetch wrapper around the Django REST API, with token auth + file upload.
const BASE = import.meta.env.VITE_API_BASE || "/api";
const TOKEN_KEY = "qptool_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY) || "",
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  // Let the browser set the multipart boundary; only force JSON for JSON bodies.
  if (!isForm && options.body) headers["Content-Type"] = "application/json";
  const token = tokenStore.get();
  if (token) headers["Authorization"] = `Token ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    const err = new Error(`API ${res.status}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// DRF list endpoints are paginated → {count, results}. Normalise to an array.
const results = (data) => (Array.isArray(data) ? data : data?.results ?? []);

export const api = {
  // ---- public reads ----
  settings: () => request("/settings/"),
  categories: () => request("/categories/").then(results),
  brands: () => request("/brands/").then(results),
  products: (params = {}) => {
    // Build the query string by hand so array values (e.g. material=[…])
    // expand into repeated keys the DRF backend expects, and empty values
    // are dropped.
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value == null || value === "") return;
      if (Array.isArray(value)) value.forEach((v) => v != null && v !== "" && qs.append(key, v));
      else qs.append(key, value);
    });
    const s = qs.toString();
    return request(`/products/${s ? `?${s}` : ""}`);
  },
  product: (slug) => request(`/products/${encodeURIComponent(slug)}/`),
  articles: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") qs.append(k, v);
    });
    const s = qs.toString();
    return request(`/articles/${s ? `?${s}` : ""}`).then(results);
  },
  article: (slug) => request(`/articles/${encodeURIComponent(slug)}/`),
  heroSlides: () => request("/hero-slides/").then(results),
  advantages: () => request("/advantages/").then(results),
  clientLogos: () => request("/client-logos/").then(results),
  catalogs: () => request("/catalogs/").then(results),

  // ---- public write ----
  createLead: (payload) =>
    request("/leads/", { method: "POST", body: JSON.stringify(payload) }),

  // ---- auth ----
  login: async (username, password) => {
    const data = await request("/auth/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    tokenStore.set(data.token);
    return data;
  },
  me: () => request("/auth/me/"),
  logout: () => tokenStore.clear(),

  // ---- admin: site images (authenticated, multipart) ----
  updateHeroSlide: (id, formData) =>
    request(`/hero-slides/${id}/`, { method: "PATCH", body: formData }),
  updateClientLogo: (id, formData) =>
    request(`/client-logos/${id}/`, { method: "PATCH", body: formData }),
  updateArticle: (slug, formData) =>
    request(`/articles/${encodeURIComponent(slug)}/`, { method: "PATCH", body: formData }),

  // ---- admin: product images ----
  productImages: (productSlug) =>
    request(`/product-images/?product__slug=${encodeURIComponent(productSlug)}`).then(results),
  createProductImage: (formData) =>
    request("/product-images/", { method: "POST", body: formData }),
  deleteProductImage: (id) =>
    request(`/product-images/${id}/`, { method: "DELETE" }),

  // ---- admin: site settings ----
  updateSettings: (payload) =>
    request("/settings/", { method: "PATCH", body: JSON.stringify(payload) }),
  // Загрузка картинок настроек (напр. about_image) — multipart.
  updateSettingsImage: (formData) =>
    request("/settings/", { method: "PATCH", body: formData }),

  // ---- admin: catalog files (PDF) ----
  createCatalog: (formData) =>
    request("/catalogs/", { method: "POST", body: formData }),
  updateCatalog: (slug, formData) =>
    request(`/catalogs/${encodeURIComponent(slug)}/`, { method: "PATCH", body: formData }),
  deleteCatalog: (slug) =>
    request(`/catalogs/${encodeURIComponent(slug)}/`, { method: "DELETE" }),
};

export { results };
