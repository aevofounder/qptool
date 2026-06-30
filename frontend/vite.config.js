import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, proxy /api and /media to the Django backend so the SPA can call
// relative URLs without CORS friction. Override the target with API_PROXY.
const API_TARGET = process.env.API_PROXY || "http://127.0.0.1:8000";

// Marketing routes worth prerendering to static HTML for SEO/crawlers.
// Dynamic /product/:slug pages stay client-rendered (their <meta> is still
// set at runtime via useSeo).
const PRERENDER_ROUTES = ["/", "/catalog", "/catalogs", "/solutions", "/about", "/contacts"];

// `npm run build` stays a plain SPA build (no extra deps required).
// `npm run build:prerender` opts in: install the two prerender packages first
//   npm i -D @prerenderer/rollup-plugin @prerenderer/renderer-puppeteer
// then run the script — each route is rendered to a static index.html so
// search engines get fully-formed markup without executing JS.
export default defineConfig(async () => {
  const plugins = [react()];

  if (process.env.PRERENDER) {
    const [{ default: prerender }, { default: PuppeteerRenderer }] = await Promise.all([
      import("@prerenderer/rollup-plugin"),
      import("@prerenderer/renderer-puppeteer"),
    ]);
    plugins.push(
      prerender({
        routes: PRERENDER_ROUTES,
        renderer: new PuppeteerRenderer({
          // wait for async settings/data to resolve before snapshotting
          renderAfterTime: 1500,
        }),
      })
    );
  }

  return {
    plugins,
    server: {
      port: 5173,
      host: true,
      allowedHosts: true,
      proxy: {
        "/api": { target: API_TARGET, changeOrigin: true },
        "/media": { target: API_TARGET, changeOrigin: true },
      },
    },
  };
});
