import { useEffect } from "react";
import { SEO } from "../config/site.js";

/**
 * useSeo — imperatively manage per-route document head for an SPA without
 * pulling in react-helmet. Sets <title>, meta description, canonical,
 * Open Graph + Twitter tags, and (optionally) a JSON-LD structured-data block.
 *
 * Usage:
 *   useSeo({
 *     title: "Каталог продукции",
 *     description: "…",
 *     jsonLd: { "@context": "https://schema.org", "@type": "…", … },
 *   });
 */
const SITE_NAME = SEO.siteName;
const TITLE_SUFFIX = SEO.titleSuffix;

function upsertMeta(attr, key, content) {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSeo({ title, description, jsonLd, type = "website", noindex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : TITLE_SUFFIX;
    document.title = fullTitle;

    const url = window.location.origin + window.location.pathname;
    const desc = description || "";

    upsertMeta("name", "description", desc);
    upsertMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow");
    upsertLink("canonical", url);

    const ogImageUrl = window.location.origin + SEO.ogImage;

    // Open Graph
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:locale", SEO.locale);
    upsertMeta("property", "og:image", ogImageUrl);

    // Twitter
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("name", "twitter:image", ogImageUrl);

    // Structured data (one managed block, replaced per route).
    const SD_ID = "route-jsonld";
    const existing = document.getElementById(SD_ID);
    if (jsonLd) {
      const script = existing || document.createElement("script");
      script.type = "application/ld+json";
      script.id = SD_ID;
      script.textContent = JSON.stringify(jsonLd);
      if (!existing) document.head.appendChild(script);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, jsonLd, type, noindex]);
}
