from django.db import models
from django.utils.text import slugify


class Catalog(models.Model):
    """A downloadable catalog / price-list file (PDF etc.) shown on the
    public «Каталоги» page and managed from the admin panel."""

    title = models.CharField("Название", max_length=200)
    slug = models.SlugField("Слаг", max_length=220, unique=True, blank=True)
    description = models.TextField("Описание", blank=True)
    file = models.FileField("Файл (PDF и т.п.)", upload_to="catalogs/")
    cover = models.ImageField("Обложка", upload_to="catalogs/covers/", blank=True, null=True)
    order = models.PositiveIntegerField("Порядок", default=0)
    is_published = models.BooleanField("Опубликован", default=True)
    created_at = models.DateTimeField("Загружен", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)

    class Meta:
        verbose_name = "Каталог (файл)"
        verbose_name_plural = "Каталоги (файлы)"
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title, allow_unicode=True) or "catalog"
            self.slug = base
        super().save(*args, **kwargs)

    @property
    def file_size(self):
        """Size of the uploaded file in bytes (0 if unavailable)."""
        try:
            return self.file.size
        except (ValueError, FileNotFoundError, OSError):
            return 0
