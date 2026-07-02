import { Link } from "react-router-dom";

/**
 * Явный чекбокс согласия на обработку персональных данных (152-ФЗ).
 * Раньше согласие «зашивалось» как consent:true без действия пользователя —
 * теперь это осознанный выбор, без которого форма не отправляется.
 */
export default function ConsentField({ checked, onChange, id = "consent" }) {
  return (
    <label className="consent" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="consent__box"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
      />
      <span className="consent__text">
        Я согласен на обработку персональных данных и принимаю{" "}
        <Link to="/privacy" className="consent__link" target="_blank" rel="noopener">
          политику конфиденциальности
        </Link>
        .
      </span>
    </label>
  );
}
