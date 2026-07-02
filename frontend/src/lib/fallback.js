// Static fallbacks mirroring the backend seed data, so the marketing pages
// stay visually complete if the API is unreachable or still loading.
import { COMPANY } from "../config/site.js";

export const FALLBACK_SETTINGS = {
  company_name: COMPANY.legalName,
  tagline: COMPANY.tagline,
  phone_primary: COMPANY.phonePrimary,
  phone_secondary: COMPANY.phoneSecondary,
  email: COMPANY.email,
  address: COMPANY.address,
  work_hours: COMPANY.workHours,
  map_embed_url: "",
};

export const FALLBACK_HERO = [
  {
    number: "01",
    tag: "Металлорежущий инструмент",
    title: "Режущий инструмент для вашего предприятия",
    description:
      "Фрезы, свёрла, токарные пластины, метчики и резцы от проверенных мировых производителей — со склада и под заказ.",
  },
  {
    number: "02",
    tag: "Оснащение станков",
    title: "Комплексное оснащение станков со скидкой",
    description:
      "Подберём и поставим полный комплект оснастки под конкретный парк оборудования вашего цеха.",
  },
  {
    number: "03",
    tag: "Инжиниринговые решения",
    title: "Профессиональный подбор инструмента под ключ",
    description:
      "Разрабатываем технологию, подбираем инструмент по техническому заданию и участвуем в запуске проекта.",
  },
];

// Short tab labels for the hero (two lines, matching the export's pre-line).
export const HERO_TABS = [
  "Металлорежущий\nинструмент",
  "Оснащение\nстанков",
  "Инжиниринг\nпод ключ",
];

export const FALLBACK_ADVANTAGES = [
  { number: "01", title: "Оригинальная продукция", description: "Поставляем инструмент только от проверенных производителей и контролируем качество.", accent: false },
  { number: "02", title: "15 лет опыта поставок", description: "На рынке металлообработки с 2009 года — знаем рынок и логистику изнутри.", accent: true },
  { number: "03", title: "Индивидуальный подход", description: "Ценим каждого заказчика независимо от объёма заказа и работаем вдолгую.", accent: false },
  { number: "04", title: "Прозрачность процессов", description: "Всегда работаем по договору и чётко обозначаем сроки поставки.", accent: false },
];

export const FALLBACK_ARTICLES = [
  { id: 1, title: "Как выбрать фрезу под конкретный материал", category_label: "Технологии", published_at: "2026-06-12" },
  { id: 2, title: "Оснащение станка с ЧПУ: с чего начать", category_label: "Оснастка", published_at: "2026-06-04" },
  { id: 3, title: "Снижаем стоимость инструмента на 20%", category_label: "Экономика", published_at: "2026-05-28" },
];
