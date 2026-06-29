from django.contrib import admin
from django.utils.html import format_html

from .models import Article, ArticleCategory


@admin.register(ArticleCategory)
class ArticleCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "article_total")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Статей")
    def article_total(self, obj):
        return obj.articles.count()


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_published", "published_at", "cover_preview")
    list_filter = ("is_published", "category", "published_at")
    list_editable = ("is_published",)
    search_fields = ("title", "excerpt", "body")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "published_at"
    autocomplete_fields = ("category",)
    fieldsets = (
        ("Основное", {"fields": ("title", "slug", "category", "cover")}),
        ("Текст", {"fields": ("excerpt", "body")}),
        ("Публикация", {"fields": ("is_published", "published_at")}),
    )

    @admin.display(description="Обложка")
    def cover_preview(self, obj):
        if obj.cover:
            return format_html(
                '<img src="{}" style="height:42px;border-radius:4px;" />', obj.cover.url
            )
        return "—"
