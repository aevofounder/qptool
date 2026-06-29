from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Public, write-only endpoint — the contact form posts here."""

    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [AllowAny]
    http_method_names = ["post", "options"]
