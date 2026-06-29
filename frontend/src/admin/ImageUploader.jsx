import { useEffect, useRef, useState } from "react";

function errMsg(err) {
  const d = err?.detail;
  if (!d) return "Ошибка сохранения";
  if (typeof d === "string") return d;
  if (d.detail) return d.detail;
  try {
    return Object.entries(d)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("; ");
  } catch {
    return "Ошибка сохранения";
  }
}

/**
 * Reusable image control for the admin panel: shows the current image, lets
 * you pick a new file with an instant preview, save it, and open the page
 * where it appears on the public site.
 *
 * `onSave(file)` must return a promise that performs the upload.
 */
export default function ImageUploader({
  title,
  subtitle,
  currentUrl,
  openHref,
  onSave,
  accept = "image/*",
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState({ state: "idle", error: null });
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const choose = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setStatus({ state: "idle", error: null });
    }
  };

  const cancel = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const save = async () => {
    if (!file) return;
    setStatus({ state: "saving", error: null });
    try {
      await onSave(file);
      setStatus({ state: "saved", error: null });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setStatus({ state: "error", error: errMsg(err) });
    }
  };

  const shown = preview || currentUrl;

  return (
    <div className="iu">
      <div className="iu__thumb">
        {shown ? <img src={shown} alt="" /> : <span className="mono">НЕТ ФОТО</span>}
        {preview && <span className="iu__badge">предпросмотр</span>}
      </div>
      <div className="iu__body">
        <div className="iu__title">{title}</div>
        {subtitle && <div className="iu__sub mono">{subtitle}</div>}
        <div className="iu__actions">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={choose}
            style={{ display: "none" }}
          />
          <button className="btn btn-outline" onClick={() => inputRef.current?.click()}>
            Выбрать файл
          </button>
          {file && (
            <button className="btn btn-red" onClick={save} disabled={status.state === "saving"}>
              {status.state === "saving" ? "Сохраняем…" : "Сохранить"}
            </button>
          )}
          {file && (
            <button className="btn btn-ghost" onClick={cancel}>
              Отмена
            </button>
          )}
          {openHref && (
            <a className="iu__link" href={openHref} target="_blank" rel="noopener noreferrer">
              Открыть на сайте ↗
            </a>
          )}
        </div>
        {status.state === "saved" && <div className="iu__ok">Сохранено ✓</div>}
        {status.state === "error" && <div className="iu__err">{status.error}</div>}
      </div>
    </div>
  );
}
