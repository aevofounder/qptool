from rest_framework import serializers

from .models import Catalog


class CatalogSerializer(serializers.ModelSerializer):
    size_label = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = Catalog
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "file",
            "file_name",
            "cover",
            "size_label",
            "order",
            "is_published",
            "created_at",
        ]
        read_only_fields = ["id", "slug", "created_at"]

    def get_size_label(self, obj):
        size = obj.file_size
        if not size:
            return ""
        units = ["Б", "КБ", "МБ", "ГБ"]
        value = float(size)
        for unit in units:
            if value < 1024 or unit == units[-1]:
                if unit == "Б":
                    return f"{int(value)} {unit}"
                return f"{value:.1f} {unit}"
            value /= 1024
        return ""

    def get_file_name(self, obj):
        try:
            return obj.file.name.split("/")[-1]
        except Exception:
            return ""
