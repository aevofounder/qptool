// Static fallbacks mirroring the backend seed data, so the marketing pages
// stay visually complete if the API is unreachable or still loading.

export const FALLBACK_SETTINGS = {
  company_name: "ООО «КуПиТул» (QP Tool)",
  tagline: "ОФИЦИАЛЬНЫЙ ПОСТАВЩИК · ЕКАТЕРИНБУРГ · С 2009",
  phone_primary: "+7 (343) 302-00-96",
  phone_secondary: "+7 (912) 051-82-21",
  email: "info@qptool.ru",
  address: "620144, г. Екатеринбург, ул. Московская, д. 195, офис 1026, 1037",
  work_hours: "Пн–Пт: 9:00–18:00; Сб–Вс: выходной",
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
