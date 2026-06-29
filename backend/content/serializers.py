from rest_framework import serializers

from .models import Article, ArticleCategory


class ArticleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleCategory
        fields = ["id", "name", "slug"]


class ArticleListSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    category_label = serializers.CharField(source="category.name", read_only=True, default="")

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "category_label",
            "cover",
            "excerpt",
            "published_at",
        ]


class ArticleDetailSerializer(ArticleListSerializer):
    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + ["body", "updated_at"]
