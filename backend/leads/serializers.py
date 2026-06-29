from rest_framework import serializers

from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "message",
            "source",
            "related_product",
            "page_url",
            "consent",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_consent(self, value):
        if value is not True:
            raise serializers.ValidationError(
                "Необходимо согласие на обработку персональных данных."
            )
        return value
