import { useCallback, useState } from "react";
import { api } from "./api.js";
import { trackEvent } from "./analytics.js";

/**
 * useLeadForm — общая логика отправки заявки (лида), которую раньше дублировали
 * страницы Contacts и Specification: единое состояние отправки, обработка
 * ошибок API, защита от повторной отправки и цель аналитики при успехе.
 *
 * Возвращает:
 *   status  — { state: "idle"|"sending"|"sent"|"error", error }
 *   submit(payload) — отправляет лид; резолвится в true при успехе
 *   reset() — сброс в исходное состояние
 *   флаги sending / sent / error для удобства в разметке
 */
export function useLeadForm() {
  const [status, setStatus] = useState({ state: "idle", error: null });

  const submit = useCallback(async (payload) => {
    // Защита от повторной отправки: пока идёт запрос — игнорируем повторный вызов.
    let allow = true;
    setStatus((s) => {
      if (s.state === "sending") allow = false;
      return { state: "sending", error: null };
    });
    if (!allow) return false;

    try {
      await api.createLead(payload);
      setStatus({ state: "sent", error: null });
      trackEvent("lead_submit", { source: payload?.source || "form" });
      return true;
    } catch (err) {
      const msg =
        (err?.detail && (err.detail.detail || JSON.stringify(err.detail))) ||
        "Не удалось отправить заявку. Попробуйте позже.";
      setStatus({ state: "error", error: msg });
      return false;
    }
  }, []);

  const reset = useCallback(() => setStatus({ state: "idle", error: null }), []);

  return {
    status,
    submit,
    reset,
    sending: status.state === "sending",
    sent: status.state === "sent",
    error: status.state === "error" ? status.error : null,
  };
}
