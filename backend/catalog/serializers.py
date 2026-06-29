from rest_framework import serializers

from .models import Brand, Category, Product, ProductImage, ProductSpec


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug"]


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "order", "is_active", "product_count"]


class ProductSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpec
        fields = ["name", "value", "order"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt", "is_main", "order"]


class ProductImageWriteSerializer(serializers.ModelSerializer):
    """Used by the admin panel to attach/replace a product photo — requires
    the parent product and exposes its code for convenient listing."""

    product_code = serializers.CharField(source="product.code", read_only=True)

    class Meta:
        model = ProductImage
        fields = ["id", "product", "product_code", "image", "alt", "is_main", "order"]


class ProductListSerializer(serializers.ModelSerializer):
    """Compact representation for the catalog grid."""

    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    category_label = serializers.CharField(source="category.name", read_only=True)
    brand = serializers.CharField(source="brand.name", read_only=True, default="")
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "code",
            "name",
            "slug",
            "category",
            "category_label",
            "brand",
            "material",
            "availability",
            "price_on_request",
            "price",
            "is_featured",
            "main_image",
        ]

    def get_main_image(self, obj):
        img = next((i for i in obj.images.all() if i.is_main), None) or (
            obj.images.all()[0] if obj.images.all() else None
        )
        if not img:
            return None
        request = self.context.get("request")
        url = img.image.url
        return request.build_absolute_uri(url) if request else url


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full product card with specs, images and related items."""

    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    specs = ProductSpecSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    availability_display = serializers.CharField(
        source="get_availability_display", read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "code",
            "name",
            "slug",
            "category",
            "brand",
            "material",
            "description",
            "availability",
            "availability_display",
            "price_on_request",
            "price",
            "is_active",
            "is_featured",
            "specs",
            "images",
            "created_at",
            "updated_at",
        ]
