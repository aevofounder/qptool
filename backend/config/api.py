"""Central DRF router wiring every app's viewsets under /api/."""

from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView

from catalog.views import (
    BrandViewSet,
    CategoryViewSet,
    ProductImageViewSet,
    ProductViewSet,
)
from catalogs.views import CatalogViewSet
from content.views import ArticleCategoryViewSet, ArticleViewSet
from leads.views import LeadViewSet
from siteconfig.views import (
    AdvantageViewSet,
    ClientLogoViewSet,
    HeroSlideViewSet,
    PageContentViewSet,
    SiteSettingsView,
)


class MeView(APIView):
    """Return the authenticated user — used by the admin panel to validate a
    stored token on load."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response(
            {"id": u.id, "username": u.username, "is_staff": u.is_staff}
        )


router = DefaultRouter()
# Catalog
router.register("categories", CategoryViewSet, basename="category")
router.register("brands", BrandViewSet, basename="brand")
router.register("products", ProductViewSet, basename="product")
router.register("product-images", ProductImageViewSet, basename="product-image")
# Content
router.register("article-categories", ArticleCategoryViewSet, basename="article-category")
router.register("articles", ArticleViewSet, basename="article")
# Catalog files (PDF)
router.register("catalogs", CatalogViewSet, basename="catalog-file")
# Leads (public, write-only)
router.register("leads", LeadViewSet, basename="lead")
# Site config
router.register("hero-slides", HeroSlideViewSet, basename="hero-slide")
router.register("client-logos", ClientLogoViewSet, basename="client-logo")
router.register("advantages", AdvantageViewSet, basename="advantage")
router.register("page-content", PageContentViewSet, basename="page-content")

urlpatterns = [
    path("", include(router.urls)),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
    path("auth/token/", obtain_auth_token, name="auth-token"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
]
