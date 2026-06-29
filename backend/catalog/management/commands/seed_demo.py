"""
Populate the database with the demo content from the QP Tool design export
(hero slides, categories, products with specs, advantages, articles, settings).

Idempotent: safe to run repeatedly — records are matched by natural keys.

    python manage.py seed_demo
"""

from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Brand, Category, Product, ProductSpec
from content.models import Article, ArticleCategory
from siteconfig.models import Advantage, ClientLogo, HeroSlide, SiteSettings

CATEGORIES = [
    ("Фрезы", "frezy"),
    ("Свёрла", "sverla"),
    ("Токарные пластины", "plastiny"),
    ("Метчики", "metchiki"),
    ("Резцы", "rezcy"),
    ("Оснастка", "osnastka"),
]

PRODUCTS = [
    {
        "code": "FR-1204", "name": "Фреза концевая Ø12", "cat": "frezy",
        "brand": "Sandvik", "material": "Твердосплав",
        "desc": "Концевая твердосплавная фреза для черновой и чистовой обработки сталей и чугунов. Покрытие TiAlN повышает стойкость на высоких скоростях резания.",
        "specs": [("Диаметр", "12 мм"), ("Число зубьев", "4"), ("Покрытие", "TiAlN"),
                  ("Хвостовик", "Цилиндрический"), ("Длина", "83 мм"), ("Обработка", "Сталь, чугун")],
    },
    {
        "code": "SV-0850", "name": "Сверло спиральное Ø8.5", "cat": "sverla",
        "brand": "Walter", "material": "HSS-Co",
        "desc": "Спиральное сверло из кобальтовой быстрорежущей стали для сверления конструкционных и нержавеющих сталей.",
        "specs": [("Диаметр", "8.5 мм"), ("Угол при вершине", "140°"), ("Покрытие", "TiN"),
                  ("Хвостовик", "Цилиндрический"), ("Длина", "117 мм"), ("Обработка", "Сталь, нерж.")],
    },
    {
        "code": "PL-CNMG", "name": "Пластина токарная CNMG", "cat": "plastiny",
        "brand": "Korloy", "material": "Твердосплав",
        "desc": "Сменная многогранная пластина для токарной обработки сталей. Универсальная геометрия для получистовой и чистовой обработки.",
        "specs": [("Тип", "CNMG 120408"), ("Радиус", "0.8 мм"), ("Покрытие", "CVD"),
                  ("Геометрия", "PM"), ("Обработка", "Сталь"), ("Класс", "P25")],
    },
    {
        "code": "MT-M1015", "name": "Метчик машинный M10", "cat": "metchiki",
        "brand": "YG-1", "material": "HSS-E",
        "desc": "Машинный метчик для нарезания метрической резьбы M10 в сквозных и глухих отверстиях стальных деталей.",
        "specs": [("Резьба", "M10 × 1.5"), ("Класс", "6H"), ("Покрытие", "TiCN"),
                  ("Хвостовик", "DIN 371"), ("Заборная часть", "3-4 нитки"), ("Обработка", "Сталь")],
    },
    {
        "code": "RZ-2520", "name": "Резец проходной 25×20", "cat": "rezcy",
        "brand": "QP Tool", "material": "Державка + пластина",
        "desc": "Проходной токарный резец со сменной пластиной для наружного продольного точения. Жёсткая державка обеспечивает стабильность.",
        "specs": [("Сечение", "25 × 20 мм"), ("Пластина", "CNMG"), ("Тип", "Проходной"),
                  ("Угол", "95°"), ("Крепление", "Рычажное"), ("Обработка", "Сталь")],
    },
    {
        "code": "OS-ER32", "name": "Патрон цанговый ER32", "cat": "osnastka",
        "brand": "BT40", "material": "Сталь",
        "desc": "Цанговый патрон ER32 с конусом BT40 для закрепления концевого инструмента на станках с ЧПУ. Высокая точность биения.",
        "specs": [("Конус", "BT40"), ("Цанга", "ER32"), ("Диапазон", "2–20 мм"),
                  ("Биение", "≤0.005 мм"), ("Балансировка", "G2.5"), ("Длина", "100 мм")],
    },
    {
        "code": "FR-0603", "name": "Фреза концевая Ø6", "cat": "frezy",
        "brand": "Seco", "material": "Твердосплав",
        "desc": "Трёхзубая твердосплавная фреза для обработки нержавеющих сталей и титановых сплавов. Покрытие AlTiN для высоких температур.",
        "specs": [("Диаметр", "6 мм"), ("Число зубьев", "3"), ("Покрытие", "AlTiN"),
                  ("Хвостовик", "Цилиндрический"), ("Длина", "57 мм"), ("Обработка", "Нерж., титан")],
    },
    {
        "code": "SV-1200", "name": "Сверло корпусное Ø12", "cat": "sverla",
        "brand": "Sandvik", "material": "Корпус + пластины",
        "desc": "Корпусное сверло со сменными пластинами для производительного сверления отверстий с внутренним подводом СОЖ.",
        "specs": [("Диаметр", "12 мм"), ("Глубина", "3×D"), ("Пластины", "сменные"),
                  ("СОЖ", "внутренний подвод"), ("Хвостовик", "Weldon"), ("Обработка", "Сталь")],
    },
    {
        "code": "PL-WNMG", "name": "Пластина токарная WNMG", "cat": "plastiny",
        "brand": "Korloy", "material": "Твердосплав",
        "desc": "Шестигранная негативная пластина для черновой и получистовой токарной обработки. Шесть режущих кромок.",
        "specs": [("Тип", "WNMG 080408"), ("Радиус", "0.8 мм"), ("Покрытие", "CVD"),
                  ("Геометрия", "PC"), ("Обработка", "Сталь, чугун"), ("Класс", "P35")],
    },
    {
        "code": "MT-M0810", "name": "Метчик машинный M8", "cat": "metchiki",
        "brand": "YG-1", "material": "HSS-E",
        "desc": "Машинный метчик для нарезания резьбы M8 в чугунных деталях. Прямые канавки для коротких сходящих стружек.",
        "specs": [("Резьба", "M8 × 1.25"), ("Класс", "6H"), ("Покрытие", "без"),
                  ("Хвостовик", "DIN 371"), ("Заборная часть", "3-4 нитки"), ("Обработка", "Чугун")],
    },
    {
        "code": "FR-1606", "name": "Фреза дисковая Ø160", "cat": "frezy",
        "brand": "Walter", "material": "Корпус + пластины",
        "desc": "Дисковая фреза со сменными пластинами для пазовой и отрезной обработки. Высокая производительность съёма.",
        "specs": [("Диаметр", "160 мм"), ("Зубья", "12"), ("Пластины", "сменные"),
                  ("Посадка", "Ø40"), ("Ширина", "6 мм"), ("Обработка", "Сталь")],
    },
    {
        "code": "OS-VISE6", "name": "Тиски станочные 160", "cat": "osnastka",
        "brand": "QP Tool", "material": "Чугун",
        "desc": "Прецизионные станочные тиски для надёжного закрепления заготовок при фрезеровании. Закалённые губки.",
        "specs": [("Ширина губок", "160 мм"), ("Раскрытие", "0–210 мм"), ("Высота", "78 мм"),
                  ("Точность", "0.02 мм"), ("Усилие", "40 кН"), ("Масса", "24 кг")],
    },
]

HERO_SLIDES = [
    ("01", "Металлорежущий инструмент", "Режущий инструмент для вашего предприятия",
     "Фрезы, свёрла, токарные пластины, метчики и резцы от проверенных мировых производителей — со склада и под заказ."),
    ("02", "Оснащение станков", "Комплексное оснащение станков со скидкой",
     "Подберём и поставим полный комплект оснастки под конкретный парк оборудования вашего цеха."),
    ("03", "Инжиниринговые решения", "Профессиональный подбор инструмента под ключ",
     "Разрабатываем технологию, подбираем инструмент по техническому заданию и участвуем в запуске проекта."),
]

ADVANTAGES = [
    ("01", "Оригинальная продукция", "Поставляем инструмент только от проверенных производителей и контролируем качество.", False),
    ("02", "15 лет опыта поставок", "На рынке металлообработки с 2009 года — знаем рынок и логистику изнутри.", True),
    ("03", "Индивидуальный подход", "Ценим каждого заказчика независимо от объёма заказа и работаем вдолгую.", False),
    ("04", "Прозрачность процессов", "Всегда работаем по договору и чётко обозначаем сроки поставки.", False),
]

ARTICLES = [
    ("Как выбрать фрезу под конкретный материал", "Технологии", date(2026, 6, 12)),
    ("Оснащение станка с ЧПУ: с чего начать", "Оснастка", date(2026, 6, 4)),
    ("Снижаем стоимость инструмента на 20%", "Экономика", date(2026, 5, 28)),
]


class Command(BaseCommand):
    help = "Загружает демо-данные QP Tool (категории, товары, статьи, настройки)."

    @transaction.atomic
    def handle(self, *args, **options):
        # Categories
        cats = {}
        for order, (name, slug) in enumerate(CATEGORIES):
            cat, _ = Category.objects.update_or_create(
                slug=slug, defaults={"name": name, "order": order, "is_active": True}
            )
            cats[slug] = cat
        self.stdout.write(f"Категорий: {len(cats)}")

        # Products + specs
        for item in PRODUCTS:
            brand, _ = Brand.objects.get_or_create(name=item["brand"])
            product, _ = Product.objects.update_or_create(
                code=item["code"],
                defaults={
                    "name": item["name"],
                    "category": cats[item["cat"]],
                    "brand": brand,
                    "material": item["material"],
                    "description": item["desc"],
                    "availability": Product.Availability.IN_STOCK,
                    "is_active": True,
                },
            )
            product.specs.all().delete()
            ProductSpec.objects.bulk_create(
                [
                    ProductSpec(product=product, name=n, value=v, order=i)
                    for i, (n, v) in enumerate(item["specs"])
                ]
            )
        self.stdout.write(f"Товаров: {len(PRODUCTS)}")

        # Hero slides
        for order, (num, tag, title, desc) in enumerate(HERO_SLIDES):
            HeroSlide.objects.update_or_create(
                number=num,
                defaults={"tag": tag, "title": title, "description": desc,
                          "order": order, "is_active": True},
            )

        # Advantages
        for order, (num, title, desc, accent) in enumerate(ADVANTAGES):
            Advantage.objects.update_or_create(
                number=num,
                defaults={"title": title, "description": desc, "accent": accent,
                          "order": order, "is_active": True},
            )

        # Client logos (placeholders)
        for i in range(1, 7):
            ClientLogo.objects.update_or_create(
                name=f"Клиент {i}", defaults={"order": i, "is_active": True}
            )

        # Articles
        for title, rubric, pub in ARTICLES:
            ac, _ = ArticleCategory.objects.get_or_create(name=rubric)
            Article.objects.update_or_create(
                title=title,
                defaults={"category": ac, "published_at": pub, "is_published": True},
            )
        self.stdout.write(f"Статей: {len(ARTICLES)}")

        # Site settings (singleton)
        SiteSettings.objects.update_or_create(
            pk=1,
            defaults={
                "company_name": "ООО «КуПиТул» (QP Tool)",
                "tagline": "ОФИЦИАЛЬНЫЙ ПОСТАВЩИК · ЕКАТЕРИНБУРГ · С 2009",
                "phone_primary": "+7 (343) 302-00-96",
                "phone_secondary": "+7 (912) 051-82-21",
                "email": "info@qptool.ru",
                "address": "620144, г. Екатеринбург, ул. Московская, д. 195, офис 1026, 1037",
                "work_hours": "Пн–Пт: 9:00–18:00; Сб–Вс: выходной",
            },
        )

        self.stdout.write(self.style.SUCCESS("Демо-данные QP Tool загружены."))
