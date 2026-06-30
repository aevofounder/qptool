import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import { useInquiry } from "../lib/inquiry.jsx";
import { useSeo } from "../lib/seo.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

// «Обработка» checkboxes. `kw` is the keyword the backend matches (case-
// insensitively) against each product's «Обработка» spec value
// («Сталь, чугун», «Нерж., титан»…), sent as repeated ?material= params.
const MATERIALS = [
  { label: "Сталь", kw: "сталь" },
  { label: "Нержавеющая сталь", kw: "нерж" },
  { label: "Чугун", kw: "чугун" },
  { label: "Титан", kw: "титан" },
];

export default function Catalog() {
  const navigate = useNavigate();
  const inquiry = useInquiry();
  const [cat, setCat] = useState("all");
  const [brand, setBrand] = useState("all"); // brand slug
  const [materials, setMaterials] = useState([]); // selected «Обработка» keywords
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useSeo({
    title: "Каталог продукции",
    description:
      "Каталог металлорежущего инструмента QP Tool: фрезы, свёрла, токарные пластины, метчики и резцы от проверенных производителей. Поиск и фильтр по категориям и брендам.",
  });

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data: categories } = useFetch(api.categories, [], []);
  const { data: brands } = useFetch(api.brands, [], []);
  // All filtering happens server-side so it spans the whole catalog, not just
  // the current page of results.
  const { data: productData, loading } = useFetch(
    () =>
      api.products({
        ...(cat === "all" ? {} : { category__slug: cat }),
        ...(brand === "all" ? {} : { brand__slug: brand }),
        ...(materials.length ? { material: materials } : {}),
        ...(debounced ? { search: debounced } : {}),
      }),
    [cat, brand, materials, debounced],
    { results: [], count: 0 }
  );

  const cats = categories || [];
  const total = cats.reduce((sum, c) => sum + (c.product_count || 0), 0);
  const products = productData?.results || [];
  const matchCount = productData?.count ?? products.length;
  const brandOptions = brands || [];

  const catList = [{ slug: "all", name: "Все", product_count: total }, ...cats];

  const visible = products;

  const toggleMaterial = (kw) =>
    setMaterials((cur) => (cur.includes(kw) ? cur.filter((x) => x !== kw) : [...cur, kw]));

  const resetFilters = () => {
    setCat("all");
    setBrand("all");
    setMaterials([]);
    setQuery("");
  };

  const hasActiveFilters = cat !== "all" || brand !== "all" || materials.length > 0 || query.trim() !== "";

  return (
    <div>
      <div className="catalog-head">
        <Breadcrumb items={[{ label: "ГЛАВНАЯ", to: "/" }, { label: "КАТАЛОГ" }]} />
        <div className="catalog-head__row">
          <h1 className="page-title">Каталог продукции</h1>
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
            {hasActiveFilters ? `${matchCount} из ${total}` : `${total} позиций`}
          </span>
        </div>

        {/* search */}
        <form
          className="search"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <svg className="search__icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
            <line x1="11.2" y1="11.2" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className="search__input"
            placeholder="Поиск по названию, коду, производителю…"
            aria-label="Поиск по каталогу"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="search__clear"
              aria-label="Очистить поиск"
              onClick={() => setQuery("")}
            >
              ✕
            </button>
          )}
        </form>
      </div>

      <div className="catalog-layout">
        {/* filters */}
        <aside className="filters">
          <div className="filters__h">КАТЕГОРИИ</div>
          <div className="filters__cats">
            {catList.map((c) => (
              <button
                key={c.slug}
                className={`cat-btn${cat === c.slug ? " is-active" : ""}`}
                onClick={() => setCat(c.slug)}
              >
                {c.name}
                <span>{c.product_count}</span>
              </button>
            ))}
          </div>

          {brandOptions.length > 0 && (
            <>
              <div className="filters__h">ПРОИЗВОДИТЕЛЬ</div>
              <div className="filters__cats">
                <button
                  className={`cat-btn${brand === "all" ? " is-active" : ""}`}
                  onClick={() => setBrand("all")}
                >
                  Все бренды
                </button>
                {brandOptions.map((b) => (
                  <button
                    key={b.slug}
                    className={`cat-btn${brand === b.slug ? " is-active" : ""}`}
                    onClick={() => setBrand(b.slug)}
                  >
                    {b.name}
                    {b.product_count != null && <span>{b.product_count}</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="filters__h">ОБРАБОТКА</div>
          <div className="filters__checks">
            {MATERIALS.map((m) => {
              const checked = materials.includes(m.kw);
              return (
                <button
                  type="button"
                  className="check"
                  key={m.kw}
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleMaterial(m.kw)}
                >
                  <span className={`check__box${checked ? " is-checked" : ""}`} aria-hidden="true" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button className="filters__reset" onClick={resetFilters}>
              СБРОСИТЬ ФИЛЬТРЫ
            </button>
          )}
        </aside>

        {/* grid */}
        <div className="product-grid-wrap">
          {loading && products.length === 0 ? (
            <div className="loading">ЗАГРУЗКА…</div>
          ) : visible.length === 0 ? (
            <div className="empty">
              {query.trim()
                ? `НИЧЕГО НЕ НАЙДЕНО ПО ЗАПРОСУ «${query.trim()}»`
                : "НЕТ ПОЗИЦИЙ ПО ВЫБРАННЫМ ФИЛЬТРАМ"}
            </div>
          ) : (
            <div className="product-grid">
              {visible.map((p) => {
                const inList = inquiry.has(p.code);
                return (
                  <div
                    className="pcard"
                    key={p.id}
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    <div className="pcard__media hatch">
                      {p.main_image ? (
                        <img
                          src={p.main_image}
                          alt={p.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                        />
                      ) : (
                        <span className="ph">ФОТО</span>
                      )}
                      <span className="pcard__code">{p.code}</span>
                    </div>
                    <div className="pcard__body">
                      <div className="pcard__meta">
                        {p.category_label}
                        {p.brand ? ` · ${p.brand}` : ""}
                      </div>
                      <h3 className="pcard__name">{p.name}</h3>
                      <div className="pcard__foot">
                        <span className="pcard__price">Цена по запросу</span>
                        <span className="pcard__open">Открыть →</span>
                      </div>
                      <button
                        type="button"
                        className={`pcard__add${inList ? " is-in" : ""}`}
                        aria-pressed={inList}
                        onClick={(e) => {
                          e.stopPropagation();
                          inquiry.toggle({ code: p.code, name: p.name, slug: p.slug });
                        }}
                      >
                        {inList ? "✓ В спецификации" : "+ В спецификацию"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
