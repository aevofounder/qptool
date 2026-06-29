from django.db import models
from django.utils.text import slugify


class Brand(models.Model):
    """Producer of the tools (Sandvik, Walter, Korloy, …)."""

    name = models.CharField("Название", max_length=120, unique=True)
    slug = models.SlugField("Слаг", max_length=140, unique=True, blank=True)

    class Meta:
        verbose_name = "Производитель"
        verbose_name_plural = "Производители"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Category(models.Model):
    """Catalog category used by the filter sidebar (Фрезы, Свёрла, …)."""

    name = models.CharField("Название", max_length=120)
    slug = models.SlugField("Слаг", max_length=140, unique=True)
    order = models.PositiveIntegerField("Порядок", default=0)
    is_active = models.BooleanField("Активна", default=True)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    @property
    def active_product_count(self):
        return self.products.filter(is_active=True).count()


class Product(models.Model):
    class Availability(models.TextChoices):
        IN_STOCK = "in_stock", "На складе"
        ON_ORDER = "on_order", "Под заказ"
        OUT = "out", "Нет в наличии"

    code = models.CharField("Артикул", max_length=40, unique=True)
    name = models.CharField("Название", max_length=200)
    slug = models.SlugField("Слаг", max_length=220, unique=True, blank=True)
    category = models.ForeignKey(
        Category,
        verbose_name="Категория",
        related_name="products",
        on_delete=models.PROTECT,
    )
    brand = models.ForeignKey(
        Brand,
        verbose_name="Производитель",
        related_name="products",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    material = models.CharField("Материал", max_length=120, blank=True)
    description = models.TextField("Описание", blank=True)
    availability = models.CharField(
        "Наличие",
        max_length=20,
        choices=Availability.choices,
        default=Availability.IN_STOCK,
    )
    price_on_request = models.BooleanField("Цена по запросу", default=True)
    price = models.DecimalField(
        "Цена", max_digits=12, decimal_places=2, null=True, blank=True
    )
    is_active = models.BooleanField("Опубликован", default=True)
    is_featured = models.BooleanField("Рекомендуемый", default=False)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.code}-{self.name}", allow_unicode=True)
        super().save(*args, **kwargs)


class ProductSpec(models.Model):
    """A single characteristic row, e.g. ('Диаметр', '12 мм')."""

    product = models.ForeignKey(
        Product,
        verbose_name="Товар",
        related_name="specs",
        on_delete=models.CASCADE,
    )
    name = models.CharField("Параметр", max_length=120)
    value = models.CharField("Значение", max_length=200)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Характеристика"
        verbose_name_plural = "Характеристики"
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.name}: {self.value}"


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        verbose_name="Товар",
        related_name="images",
        on_delete=models.CASCADE,
    )
    image = models.ImageField("Изображение", upload_to="products/")
    alt = models.CharField("Alt-текст", max_length=200, blank=True)
    is_main = models.BooleanField("Главное", default=False)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Фото товара"
        verbose_name_plural = "Фото товара"
        ordering = ["-is_main", "order", "id"]

    def __str__(self):
        return f"Фото {self.product.code}"
