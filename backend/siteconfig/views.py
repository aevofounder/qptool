from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Advantage, ClientLogo, HeroSlide, PageContent, SiteSettings
from .serializers import (
    AdvantageSerializer,
    ClientLogoSerializer,
    HeroSlideSerializer,
    PageContentSerializer,
    SiteSettingsSerializer,
)


def _authed(request):
    return bool(request.user and request.user.is_authenticated)


class HeroSlideViewSet(viewsets.ModelViewSet):
    """Public read of active slides; authenticated write (image upload) from
    the admin panel, which also sees inactive slides."""

    serializer_class = HeroSlideSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = HeroSlide.objects.all()
        return qs if _authed(self.request) else qs.filter(is_active=True)


class ClientLogoViewSet(viewsets.ModelViewSet):
    serializer_class = ClientLogoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = ClientLogo.objects.all()
        return qs if _authed(self.request) else qs.filter(is_active=True)


class AdvantageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdvantageSerializer
    queryset = Advantage.objects.filter(is_active=True)


class PageContentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PageContentSerializer
    lookup_field = "key"
    queryset = PageContent.objects.all()


class SiteSettingsView(APIView):
    """GET the site-wide settings (public); PATCH to update (authenticated)."""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        obj = SiteSettings.load()
        return Response(SiteSettingsSerializer(obj, context={"request": request}).data)

    def patch(self, request):
        obj = SiteSettings.load()
        serializer = SiteSettingsSerializer(
            obj, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
