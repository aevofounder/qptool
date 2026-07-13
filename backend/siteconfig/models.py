from django.core.exceptions import ValidationError
from django.db import models

from common.images import compress_upload


class SingletonModel(models.Model):
    """Base for models that must have exactly one row (site-wide settings)."""

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Singletons are never deleted from the admin.
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class SiteSettings(SingletonModel):
    """Global contacts / branding shown in the header, footer and contacts page."""

    company_name = models.CharField("Название компании", max_length=200, default="QP Tool")
    tagline = models.CharField(
        "Слоган",
        max_length=200,
        blank=True,
        default="ОФИЦИАЛЬНЫЙ ПОСТАВЩИК · ЕКАТЕРИНБУРГ · С 2009",
    )
    phone_primary = models.CharField("Основной телефон", max_length=40, blank=True)
    phone_secondary = models.CharField("Доп. телефон", max_length=40, blank=True)
    email = models.EmailField("E-mail", blank=True)
    address = models.TextField("Адрес", blank=True)
    work_hours = models.CharField("График работы", max_length=200, blank=True)
    about_image = models.ImageField(
        "Фото на странице «О компании»", upload_to="site/", blank=True, null=True
    )
    map_lat = models.DecimalField(
        "Широта (карта)", max_digits=9, decimal_places=6, null=True, blank=True
    )
    map_lng = models.DecimalField(
        "Долгота (карта)", max_digits=9, decimal_places=6, null=True, blank=True
    )
    map_embed_url = models.TextField(
        "Яндекс.Карта — код вставки или ссылка",
        blank=True,
        help_text=(
            "Вставьте код из Яндекс.Конструктора карт (тег <iframe …>) "
            "или прямую ссылку на карту-виджет."
        ),
    )

    class Meta:
        verbose_name = "Настройки сайта"
        verbose_name_plural = "Настройки сайта"

    def __str__(self):
        return "Настройки сайта"

    def save(self, *args, **kwargs):
        compress_upload(self.about_image)
        super().save(*args, **kwargs)


class HeroSlide(models.Model):
    """Rotating service slides in the home hero (Металлорежущий инструмент, …)."""

    number = models.CharField("Номер", max_length=8, blank=True, help_text="например 01")
    tag = models.CharField("Тег", max_length=120)
    title = models.CharField("Заголовок", max_length=200)
    description = models.TextField("Описание", blank=True)
    image = models.ImageField("Изображение", upload_to="hero/", blank=True, null=True)
    order = models.PositiveIntegerField("Порядок", default=0)
    is_active = models.BooleanField("Активен", default=True)

    class Meta:
        verbose_name = "Слайд hero"
        verbose_name_plural = "Слайды hero"
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.number} {self.tag}".strip()

    def save(self, *args, **kwargs):
        compress_upload(self.image)
        super().save(*args, **kwargs)


class ClientLogo(models.Model):
    """Logos in the "Нам доверяют" strip."""

    name = models.CharField("Клиент", max_length=150)
    logo = models.ImageField("Логотип", upload_to="clients/", blank=True, null=True)
    url = models.URLField("Ссылка", blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)
    is_active = models.BooleanField("Активен", default=True)

    class Meta:
        verbose_name = "Логотип клиента"
        verbose_name_plural = "Логотипы клиентов"
        ordering = ["order", "id"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        compress_upload(self.logo)
        super().save(*args, **kwargs)


class Advantage(models.Model):
    """Cards in the "Почему QP Tool" / "Наши принципы" blocks."""

    number = models.CharField("Номер", max_length=8, blank=True)
    title = models.CharField("Заголовок", max_length=200)
    description = models.TextField("Описание", blank=True)
    accent = models.BooleanField("Красный акцент", default=False)
    order = models.PositiveIntegerField("Порядок", default=0)
    is_active = models.BooleanField("Активно", default=True)

    class Meta:
        verbose_name = "Преимущество"
        verbose_name_plural = "Преимущества"
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class PageContent(models.Model):
    """
    Editable text blocks for static pages (О компании, Решения, …),
    addressed by a stable string key like 'about.intro' or 'solution.hero'.
    """

    key = models.SlugField(
        "Ключ", max_length=120, unique=True, allow_unicode=True,
        help_text="Стабильный идентификатор блока, напр. about.intro",
    )
    label = models.CharField("Название (для админки)", max_length=200)
    title = models.CharField("Заголовок", max_length=300, blank=True)
    body = models.TextField("Текст", blank=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)

    class Meta:
        verbose_name = "Блок контента"
        verbose_name_plural = "Контент страниц"
        ordering = ["key"]

    def __str__(self):
        return f"{self.label} ({self.key})"
