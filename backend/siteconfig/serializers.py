from rest_framework import serializers

from .models import Advantage, ClientLogo, HeroSlide, PageContent, SiteSettings


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = ["id", "number", "tag", "title", "description", "image", "order"]


class ClientLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientLogo
        fields = ["id", "name", "logo", "url", "order"]


class AdvantageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advantage
        fields = ["id", "number", "title", "description", "accent", "order"]


class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = ["key", "label", "title", "body", "updated_at"]


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "company_name",
            "tagline",
            "phone_primary",
            "phone_secondary",
            "email",
            "address",
            "work_hours",
            "map_lat",
            "map_lng",
            "map_embed_url",
        ]
