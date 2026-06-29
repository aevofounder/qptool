from django.conf import settings
from django.contrib import admin

from .models import Advantage, ClientLogo, HeroSlide, PageContent, SiteSettings

# Apply admin branding from settings.
admin.site.site_header = getattr(settings, "ADMIN_SITE_HEADER", admin.site.site_header)
admin.site.site_title = getattr(settings, "ADMIN_SITE_TITLE", admin.site.site_title)
admin.site.index_title = getattr(settings, "ADMIN_INDEX_TITLE", admin.site.index_title)


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Компания", {"fields": ("company_name", "tagline")}),
        ("Контакты", {"fields": ("phone_primary", "phone_secondary", "email")}),
        ("Адрес", {"fields": ("address", "work_hours", "map_lat", "map_lng")}),
        ("Карта (Яндекс)", {"fields": ("map_embed_url",)}),
    )

    def has_add_permission(self, request):
        # Singleton — created automatically, never added manually.
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ("number", "tag", "title", "order", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("tag", "title", "description")


@admin.register(ClientLogo)
class ClientLogoAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("name",)


@admin.register(Advantage)
class AdvantageAdmin(admin.ModelAdmin):
    list_display = ("number", "title", "accent", "order", "is_active")
    list_editable = ("accent", "order", "is_active")
    search_fields = ("title", "description")


@admin.register(PageContent)
class PageContentAdmin(admin.ModelAdmin):
    list_display = ("label", "key", "title", "updated_at")
    search_fields = ("key", "label", "title", "body")
    prepopulated_fields = {"key": ("label",)}
