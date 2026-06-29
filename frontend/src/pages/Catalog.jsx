import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

// Checkbox label → keyword matched against the product's "Обработка" spec.
const MATERIALS = [
  { label: "Сталь", kw: "сталь" },
  { label: "Нержавеющая сталь", kw: "нерж" },
  { label: "Чугун", kw: "чугун" },
  { label: "Титан", kw: "титан" },
];

export default function Catalog() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("all");
  const [materials, setMaterials] = useState([]); // selected keywords

  const { data: categories } = useFetch(api.categories, [], []);
  const { data: productData, loading } = useFetch(
    () =>
      api.products({
        ...(cat === "all" ? {} : { category__slug: cat }),
        ...(materials.length ? { material: materials } : {}),
      }),
    [cat, materials],
    { results: [], count: null }
  );

  const cats = categories || [];
  const total = cats.reduce((sum, c) => sum + (c.product_count || 0), 0);
  const products = productData?.results || [];
  const shownCount = productData?.count ?? total;
  const hasFilters = cat !== "all" || materials.length > 0;

  const catList = [{ slug: "all", name: "Все", product_count: total }, ...cats];

  const toggleMaterial = (kw) =>
    setMaterials((cur) =>
      cur.includes(kw) ? cur.filter((x) => x !== kw) : [...cur, kw]
    );

  const reset = () => {
    setCat("all");
    setMaterials([]);
  };

  return (
    <div>
      <div className="catalog-head">
        <Breadcrumb items={[{ label: "ГЛАВНАЯ", to: "/" }, { label: "КАТАЛОГ" }]} />
        <div className="catalog-head__row">
          <h1 className="page-title">Каталог продукции</h1>
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
            {shownCount} позиций
          </span>
        </div>
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

          <div className="filters__h">ОБРАБОТКА</div>
          <div className="filters__checks">
            {MATERIALS.map((m) => {
              const checked = materials.includes(m.kw);
              return (
                <label
                  className="check"
                  key={m.kw}
                  onClick={() => toggleMaterial(m.kw)}
                >
                  <span className={`check__box${checked ? " is-checked" : ""}`} />
                  {m.label}
                </label>
              );
            })}
          </div>

          <button className="filters__reset" onClick={reset}>
            СБРОСИТЬ ФИЛЬТРЫ
          </button>
        </aside>

        {/* grid */}
        <div className="product-grid-wrap">
          {loading && products.length === 0 ? (
            <div className="loading">ЗАГРУЗКА…</div>
          ) : products.length === 0 ? (
            <div className="empty">
              {hasFilters
                ? "НЕТ ПОЗИЦИЙ ПО ВЫБРАННЫМ ФИЛЬТРАМ"
                : "НЕТ ПОЗИЦИЙ В КАТАЛОГЕ"}
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
