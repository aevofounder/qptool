import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import { useInquiry } from "../lib/inquiry.jsx";
import { useSeo } from "../lib/seo.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const inquiry = useInquiry();

  const { data: product, loading, error } = useFetch(
    () => api.product(slug),
    [slug],
    null
  );

  // Related: other items in the same category, then top up from the rest.
  const catSlug = product?.category?.slug;
  const { data: relatedData } = useFetch(
    () => (catSlug ? api.products({ category__slug: catSlug }) : Promise.resolve({ results: [] })),
    [catSlug],
    { results: [] }
  );

  // SEO — called unconditionally (before early returns) per rules of hooks.
  useSeo({
    title: product ? `${product.name} · ${product.code}` : "Товар",
    description: product
      ? `${product.name} (${product.code})${product.brand?.name ? ", " + product.brand.name : ""}. ${product.description || "Металлорежущий инструмент от QP Tool — цена по запросу."}`.slice(0, 300)
      : "Металлорежущий инструмент от QP Tool.",
    type: "product",
    noindex: !product,
    jsonLd: product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.code,
          ...(product.brand?.name ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
          ...(product.material ? { material: product.material } : {}),
          ...(product.description ? { description: product.description } : {}),
          offers: {
            "@type": "Offer",
            priceCurrency: "RUB",
            availability:
              product.availability === "in_stock"
                ? "https://schema.org/InStock"
                : "https://schema.org/PreOrder",
            seller: { "@type": "Organization", name: "QP Tool" },
          },
        }
      : null,
  });

  if (loading) return <div className="loading">ЗАГРУЗКА…</div>;
  if (error || !product)
    return (
      <div className="empty">
        ТОВАР НЕ НАЙДЕН ·{" "}
        <a className="link-red" onClick={() => navigate("/catalog")}>
          в каталог →
        </a>
      </div>
    );

  const related = (relatedData?.results || [])
    .filter((p) => p.code !== product.code)
    .slice(0, 4);

  const inStock = product.availability === "in_stock";
  const hasImages = product.images && product.images.length > 0;
  const inList = inquiry.has(product.code);

  return (
    <div>
      <div className="crumb-wrap">
        <Breadcrumb
          items={[
            { label: "ГЛАВНАЯ", to: "/" },
            { label: "КАТАЛОГ", to: "/catalog" },
            { label: product.code },
          ]}
        />
      </div>

      <div className="product">
        {/* gallery */}
        <div>
          <div className="gallery__main ph-box hatch">
            <div className="ph-label">ФОТО · {product.code}</div>
            {hasImages ? (
              <img
                src={product.images[0].image}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              />
            ) : (
              <div className="ph-center">
                <div className="gallery__plus">+</div>
              </div>
            )}
          </div>
          <div className="gallery__thumbs">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`gallery__thumb hatch-soft${i === 0 ? " is-active" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* info */}
        <div>
          <div className="product__code">
            {product.code} · {product.category?.name}
          </div>
          <h1 className="product__title">{product.name}</h1>
          <p className="product__lead">{product.description}</p>

          <div className="product__facts">
            <div>
              <div className="fact__label">ПРОИЗВОДИТЕЛЬ</div>
              <div className="fact__value">{product.brand?.name || "—"}</div>
            </div>
            <div>
              <div className="fact__label">МАТЕРИАЛ</div>
              <div className="fact__value">{product.material || "—"}</div>
            </div>
            <div>
              <div className="fact__label">НАЛИЧИЕ</div>
              <div className={`fact__value${inStock ? " in-stock" : ""}`}>
                {product.availability_display}
              </div>
            </div>
          </div>

          <div className="specs__h">ХАРАКТЕРИСТИКИ</div>
          <div className="specs">
            {product.specs.map((row, i) => (
              <div className="spec-row" key={i}>
                <span className="k">{row.name}</span>
                <span className="v">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="buy">
            <div>
              <div className="buy__label">Стоимость</div>
              <div className="buy__price">По запросу</div>
            </div>
            <button
              type="button"
              className={`btn ${inList ? "btn-outline-red" : "btn-red"}`}
              aria-pressed={inList}
              onClick={() => inquiry.toggle({ code: product.code, name: product.name, slug: product.slug })}
            >
              {inList ? "✓ В спецификации" : "+ В спецификацию"}
            </button>
            <button className="btn btn-outline" onClick={() => navigate("/contacts")}>
              Запросить цену
            </button>
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="related">
          <div className="related__inner">
            <h2 className="h2" style={{ fontSize: 26, marginBottom: 28 }}>
              Похожие позиции
            </h2>
            <div className="related__grid">
              {related.map((p) => (
                <div
                  className="rcard"
                  key={p.id}
                  onClick={() => navigate(`/product/${p.slug}`)}
                >
                  <div className="rcard__media hatch">
                    <span className="rcard__code">{p.code}</span>
                  </div>
                  <div className="rcard__body">
                    <h4 className="rcard__name">{p.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
