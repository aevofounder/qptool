"""
Динамический sitemap: статические маркетинговые страницы + все опубликованные
товары из базы (обновляется автоматически при добавлении/изменении товаров).

Домен и протокол берутся из запроса (за nginx → qptool.ru, https), поэтому
django.contrib.sites не требуется.
"""
from django.contrib.sitemaps import Sitemap

from catalog.models import Product


class StaticViewSitemap(Sitemap):
    protocol = "https"
    changefreq = "weekly"

    # (путь, приоритет)
    PAGES = [
        ("/", 1.0),
        ("/catalog", 0.9),
        ("/catalogs", 0.7),
        ("/solutions", 0.8),
        ("/about", 0.6),
        ("/contacts", 0.7),
        ("/privacy", 0.3),
    ]

    def items(self):
        return self.PAGES

    def location(self, item):
        return item[0]

    def priority(self, item):
        return item[1]


class ProductSitemap(Sitemap):
    protocol = "https"
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return Product.objects.filter(is_active=True).order_by("id")

    def location(self, obj):
        return f"/product/{obj.slug}"

    def lastmod(self, obj):
        return obj.updated_at


SITEMAPS = {
    "static": StaticViewSitemap,
    "products": ProductSitemap,
}
