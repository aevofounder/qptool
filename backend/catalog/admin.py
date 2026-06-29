from django.contrib import admin
from django.utils.html import format_html

from .models import Brand, Category, Product, ProductImage, ProductSpec


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "product_total")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Товаров")
    def product_total(self, obj):
        return obj.products.count()


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order", "is_active", "product_count")
    list_editable = ("order", "is_active")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Товаров")
    def product_count(self, obj):
        return obj.active_product_count


class ProductSpecInline(admin.TabularInline):
    model = ProductSpec
    extra = 1
    fields = ("name", "value", "order")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "preview", "alt", "is_main", "order")
    readonly_fields = ("preview",)

    @admin.display(description="Превью")
    def preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:60px;border-radius:4px;" />', obj.image.url
            )
        return "—"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "category",
        "brand",
        "availability",
        "is_active",
        "is_featured",
        "updated_at",
    )
    list_filter = ("category", "brand", "availability", "is_active", "is_featured")
    list_editable = ("is_active", "is_featured")
    search_fields = ("code", "name", "description", "material")
    autocomplete_fields = ("category", "brand")
    prepopulated_fields = {"slug": ("code", "name")}
    date_hierarchy = "created_at"
    inlines = [ProductSpecInline, ProductImageInline]
    list_select_related = ("category", "brand")
    actions = ["mark_active", "mark_inactive"]
    fieldsets = (
        ("Основное", {"fields": ("code", "name", "slug", "category", "brand")}),
        ("Описание", {"fields": ("material", "description")}),
        (
            "Наличие и цена",
            {"fields": ("availability", "price_on_request", "price")},
        ),
        ("Публикация", {"fields": ("is_active", "is_featured")}),
    )

    @admin.action(description="Опубликовать выбранные")
    def mark_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"Опубликовано товаров: {updated}")

    @admin.action(description="Снять с публикации")
    def mark_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"Снято с публикации: {updated}")
