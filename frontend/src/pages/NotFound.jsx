import { useNavigate } from "react-router-dom";
import { useSeo } from "../lib/seo.jsx";

/**
 * Страница 404. Раньше несуществующие маршруты молча рендерили главную —
 * теперь пользователь и поисковики получают явный «не найдено» (noindex).
 */
export default function NotFound() {
  const navigate = useNavigate();
  useSeo({
    title: "Страница не найдена",
    description: "Запрошенная страница не существует или была перемещена.",
    noindex: true,
  });

  return (
    <div className="fallback-screen" role="main">
      <div className="fallback-screen__code mono">404</div>
      <h1 className="fallback-screen__title">Страница не найдена</h1>
      <p className="fallback-screen__text">
        Возможно, ссылка устарела или в адресе опечатка. Вернитесь на главную
        или загляните в каталог продукции.
      </p>
      <div className="fallback-screen__actions">
        <button className="btn btn-red" onClick={() => navigate("/")}>
          На главную
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/catalog")}>
          В каталог
        </button>
      </div>
    </div>
  );
}
