from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Catalog
from .serializers import CatalogSerializer


class CatalogViewSet(viewsets.ModelViewSet):
    """Public read of published catalogs; authenticated create/update/delete
    from the custom admin panel."""

    serializer_class = CatalogSerializer
    lookup_field = "slug"
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Catalog.objects.all()
        if not (self.request.user and self.request.user.is_authenticated):
            qs = qs.filter(is_published=True)
        return qs

    def perform_create(self, serializer):
        # Multipart forms omit unchecked booleans, which DRF reads as False.
        # New catalogs should be published unless explicitly told otherwise.
        extra = {}
        if "is_published" not in self.request.data:
            extra["is_published"] = True
        serializer.save(**extra)
