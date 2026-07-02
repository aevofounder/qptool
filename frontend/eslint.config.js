import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/**
 * Flat-config ESLint для React + Vite (JSX). Держим правила прагматичными:
 * ловим реальные ошибки (неиспользуемое, hooks-правила), не превращая линтер
 * в шум. Prop-types отключены — типизация пропсов в этом проекте не ведётся.
 */
export default [
  { ignores: ["dist/**", "node_modules/**", "public/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      // Классические, проверенные правила хуков (без экспериментальных v7,
      // которые дают ложные срабатывания на валидных паттернах).
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
      "react/no-unknown-property": ["error", { ignore: ["clip-rule", "fill-rule"] }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Файлы-провайдеры намеренно соседствуют с хуками/утилитами — это
      // осознанная организация кода, а не проблема качества.
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // Конфиги Node-окружения.
    files: ["vite.config.js", "eslint.config.js"],
    languageOptions: { globals: { ...globals.node } },
  },
];
