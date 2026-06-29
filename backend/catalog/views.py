from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Brand, Category, Product, ProductImage
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductImageWriteSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = "slug"
    queryset = (
        Category.objects.filter(is_active=True)
        .annotate(product_count=Count("products", filter=Q(products__is_active=True)))
        .order_by("order", "name")
    )


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BrandSerializer
    lookup_field = "slug"
    queryset = Brand.objects.all()


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"
    filterset_fields = ["category__slug", "brand__slug", "availability", "is_featured"]
    search_fields = ["code", "name", "description", "material"]
    ordering_fields = ["created_at", "name", "code"]

    def get_queryset(self):
        qs = (
            Product.objects.filter(is_active=True)
            .select_related("category", "brand")
            .prefetch_related("images", "specs")
        )
        # "Обработка" filter (checkboxes: Сталь / Нержавеющая сталь / Чугун /
        # Титан) — match keywords against the product's "Обработка" spec value.
        # Done in Python because SQLite's LIKE/icontains only case-folds ASCII,
        # not Cyrillic; Python's str.lower() handles Unicode correctly, and the
        # catalog is small. `specs` is already prefetched, so this is cheap.
        materials = [m.lower() for m in self.request.query_params.getlist("material")]
        if materials:
            matched = []
            for product in qs:
                obrabotka = " ".join(
                    s.value for s in product.specs.all() if "обработка" in s.name.lower()
                ).lower()
                if obrabotka and any(kw in obrabotka for kw in materials):
                    matched.append(product.id)
            qs = qs.filter(id__in=matched)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer


class ProductImageViewSet(viewsets.ModelViewSet):
    """Authenticated CRUD of product photos for the admin panel."""

    serializer_class = ProductImageWriteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ["product__slug", "product"]
    queryset = ProductImage.objects.select_related("product")
