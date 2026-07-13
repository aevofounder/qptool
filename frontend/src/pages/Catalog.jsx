import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import { useInquiry, pluralRu } from "../lib/inquiry.jsx";
import { useSeo } from "../lib/seo.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { EmptyState, Skeleton } from "../components/States.jsx";

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
  const [searchParams] = useSearchParams();
  // Начальная категория может прийти из URL (?category=slug) — напр. при переходе
  // из блока «Инструмент, который мы поставляем» на странице «Решения».
  const [cat, setCat] = useState(() => searchParams.get("category") || "all");
  const [brand, setBrand] = useState("all"); // brand slug
  const [materials, setMaterials] = useState([]); // selected «Обработка» keywords
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false); // моб. bottom-sheet

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
  // Число активных фильтров (для бейджа на кнопке «Фильтры»; поиск не считаем —
  // он вынесен отдельным полем).
  const activeCount =
    (cat !== "all" ? 1 : 0) + (brand !== "all" ? 1 : 0) + materials.length;

  // Блокируем скролл body, пока открыт мобильный лист фильтров.
  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [filtersOpen]);

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

        {/* mobile-only toolbar: opens filters as a bottom sheet */}
        <div className="filters-bar">
          <button
            type="button"
            className="filters-bar__btn"
            onClick={() => setFiltersOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Фильтры
            {activeCount > 0 && <span className="filters-bar__badge">{activeCount}</span>}
          </button>
          <span className="filters-bar__count mono">
            {hasActiveFilters ? `${matchCount} из ${total}` : `${total}`}
          </span>
        </div>
      </div>

      <div className="catalog-layout">
        {/* backdrop for the mobile filters sheet */}
        <div
          className={`filters-backdrop${filtersOpen ? " is-open" : ""}`}
          onClick={() => setFiltersOpen(false)}
          aria-hidden="true"
        />
        {/* filters */}
        <aside className={`filters${filtersOpen ? " is-open" : ""}`} aria-label="Фильтры каталога">
          <div className="filters__sheet-head">
            <span className="filters__sheet-title">Фильтры</span>
            <button
              type="button"
              className="filters__sheet-close"
              onClick={() => setFiltersOpen(false)}
              aria-label="Закрыть фильтры"
            >
              ✕
            </button>
          </div>
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

          {/* mobile-only: confirm & close the sheet */}
          <button
            type="button"
            className="btn btn-red filters__apply"
            onClick={() => setFiltersOpen(false)}
          >
            Показать {matchCount} {pluralRu(matchCount, ["товар", "товара", "товаров"])}
          </button>
        </aside>

        {/* grid */}
        <div className="product-grid-wrap">
          {loading && products.length === 0 ? (
            <div className="product-grid" aria-busy="true" aria-label="Загрузка каталога">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="pcard pcard--skeleton" key={i}>
                  <Skeleton className="pcard__media" />
                  <div className="pcard__body">
                    <Skeleton style={{ height: 12, width: "40%", marginBottom: 12 }} />
                    <Skeleton style={{ height: 18, width: "85%", marginBottom: 8 }} />
                    <Skeleton style={{ height: 18, width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              title={query.trim() ? "Ничего не найдено" : "Нет позиций по фильтрам"}
              text={
                query.trim()
                  ? `По запросу «${query.trim()}» ничего не нашлось. Попробуйте изменить формулировку или сбросить фильтры.`
                  : "Под выбранные фильтры пока нет позиций. Сбросьте часть условий, чтобы увидеть больше."
              }
              action={
                hasActiveFilters && (
                  <button type="button" className="btn btn-outline-red" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
                )
              }
            />
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
                      <h3 className="pcard__name">
                        {/* Реальная ссылка = доступ с клавиатуры; клик по всей
                            карточке остаётся для мыши. */}
                        <Link
                          to={`/product/${p.slug}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.name}
                        </Link>
                      </h3>
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
