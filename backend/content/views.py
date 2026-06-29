from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Article, ArticleCategory
from .serializers import (
    ArticleCategorySerializer,
    ArticleDetailSerializer,
    ArticleListSerializer,
)


class ArticleCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ArticleCategorySerializer
    lookup_field = "slug"
    queryset = ArticleCategory.objects.all()


class ArticleViewSet(viewsets.ModelViewSet):
    """Public read of published articles; authenticated write (cover upload)
    from the admin panel, which also sees unpublished articles."""

    lookup_field = "slug"
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ["category__slug"]
    search_fields = ["title", "excerpt", "body"]
    ordering_fields = ["published_at"]

    def get_queryset(self):
        qs = Article.objects.select_related("category")
        if not (self.request.user and self.request.user.is_authenticated):
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ArticleDetailSerializer
        return ArticleListSerializer
