import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, proxy /api and /media to the Django backend so the SPA can call
// relative URLs without CORS friction. Override the target with API_PROXY.
const API_TARGET = process.env.API_PROXY || "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/media": { target: API_TARGET, changeOrigin: true },
    },
  },
});
