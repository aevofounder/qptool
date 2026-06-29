from django.contrib import admin
from django.utils.html import format_html

from .models import Catalog


@admin.register(Catalog)
class CatalogAdmin(admin.ModelAdmin):
    list_display = ("title", "cover_preview", "order", "is_published", "created_at")
    list_editable = ("order", "is_published")
    search_fields = ("title", "description")
    date_hierarchy = "created_at"
    fields = ("title", "slug", "description", "file", "cover", "order", "is_published")
    prepopulated_fields = {"slug": ("title",)}

    @admin.display(description="Обложка")
    def cover_preview(self, obj):
        if obj.cover:
            return format_html(
                '<img src="{}" style="height:42px;border-radius:4px;" />', obj.cover.url
            )
        return "—"
