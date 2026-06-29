from django.db import models
from django.utils.text import slugify


class ArticleCategory(models.Model):
    """Rubric for the "Полезные материалы" block (Технологии, Оснастка, …)."""

    name = models.CharField("Название", max_length=120, unique=True)
    slug = models.SlugField("Слаг", max_length=140, unique=True, blank=True)

    class Meta:
        verbose_name = "Рубрика статей"
        verbose_name_plural = "Рубрики статей"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Article(models.Model):
    title = models.CharField("Заголовок", max_length=220)
    slug = models.SlugField("Слаг", max_length=240, unique=True, blank=True)
    category = models.ForeignKey(
        ArticleCategory,
        verbose_name="Рубрика",
        related_name="articles",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    cover = models.ImageField("Обложка", upload_to="articles/", blank=True, null=True)
    excerpt = models.TextField("Анонс", blank=True)
    body = models.TextField("Текст", blank=True)
    is_published = models.BooleanField("Опубликована", default=True)
    published_at = models.DateField("Дата публикации")
    created_at = models.DateTimeField("Создана", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлена", auto_now=True)

    class Meta:
        verbose_name = "Статья"
        verbose_name_plural = "Статьи"
        ordering = ["-published_at", "-id"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)
