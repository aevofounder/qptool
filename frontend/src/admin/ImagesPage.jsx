import { useState } from "react";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import ImageUploader from "./ImageUploader.jsx";

const TABS = [
  { id: "hero", label: "Hero-слайды" },
  { id: "logos", label: "Логотипы клиентов" },
  { id: "products", label: "Фото товаров" },
  { id: "articles", label: "Обложки статей" },
  { id: "about", label: "О компании" },
];

function AboutImage() {
  const [reload, setReload] = useState(0);
  const { data: settings } = useFetch(api.settings, [reload], null);
  return (
    <div className="iu-list">
      <ImageUploader
        title="Фото на странице «О компании»"
        subtitle="Вертикальное фото производства/склада/команды (≈3:4)"
        currentUrl={settings?.about_image}
        openHref="/about"
        onSave={async (file) => {
          const fd = new FormData();
          fd.append("about_image", file);
          await api.updateSettingsImage(fd);
          setReload((x) => x + 1);
        }}
      />
    </div>
  );
}

function HeroImages() {
  const [reload, setReload] = useState(0);
  const { data: slides } = useFetch(api.heroSlides, [reload], []);
  return (
    <div className="iu-list">
      {(slides || []).map((s) => (
        <ImageUploader
          key={s.id}
          title={`${s.number} · ${s.tag}`}
          subtitle={s.title}
          currentUrl={s.image}
          openHref="/"
          onSave={async (file) => {
            const fd = new FormData();
            fd.append("image", file);
            await api.updateHeroSlide(s.id, fd);
            setReload((x) => x + 1);
          }}
        />
      ))}
    </div>
  );
}

function LogoImages() {
  const [reload, setReload] = useState(0);
  const { data: logos } = useFetch(api.clientLogos, [reload], []);
  return (
    <div className="iu-list">
      {(logos || []).map((l) => (
        <ImageUploader
          key={l.id}
          title={l.name}
          subtitle="Логотип клиента"
          currentUrl={l.logo}
          openHref="/"
          onSave={async (file) => {
            const fd = new FormData();
            fd.append("logo", file);
            await api.updateClientLogo(l.id, fd);
            setReload((x) => x + 1);
          }}
        />
      ))}
    </div>
  );
}

function ProductImages() {
  const [reload, setReload] = useState(0);
  const { data: products } = useFetch(
    () => api.products().then((d) => d.results || []),
    [reload],
    []
  );
  return (
    <div className="iu-list">
      {(products || []).map((p) => (
        <ImageUploader
          key={p.id}
          title={`${p.code} — ${p.name}`}
          subtitle={p.category_label}
          currentUrl={p.main_image}
          openHref={`/product/${p.slug}`}
          onSave={async (file) => {
            // Replace any existing photos so the new one becomes the main image.
            const existing = await api.productImages(p.slug);
            await Promise.all(existing.map((img) => api.deleteProductImage(img.id)));
            const fd = new FormData();
            fd.append("product", p.id);
            fd.append("image", file);
            fd.append("is_main", "true");
            await api.createProductImage(fd);
            setReload((x) => x + 1);
          }}
        />
      ))}
    </div>
  );
}

function ArticleImages() {
  const [reload, setReload] = useState(0);
  const { data: articles } = useFetch(api.articles, [reload], []);
  return (
    <div className="iu-list">
      {(articles || []).map((a) => (
        <ImageUploader
          key={a.id}
          title={a.title}
          subtitle={a.category_label}
          currentUrl={a.cover}
          openHref="/"
          onSave={async (file) => {
            const fd = new FormData();
            fd.append("cover", file);
            await api.updateArticle(a.slug, fd);
            setReload((x) => x + 1);
          }}
        />
      ))}
    </div>
  );
}

export default function ImagesPage() {
  const [tab, setTab] = useState("hero");
  return (
    <div>
      <h1 className="admin__h1">Картинки сайта</h1>
      <p className="admin__lead">
        Выбери файл — увидишь предпросмотр, нажми «Сохранить», затем «Открыть на
        сайте», чтобы проверить результат.
      </p>
      <div className="admin__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin__tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "hero" && <HeroImages />}
      {tab === "logos" && <LogoImages />}
      {tab === "products" && <ProductImages />}
      {tab === "articles" && <ArticleImages />}
      {tab === "about" && <AboutImage />}
    </div>
  );
}
