from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle

from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Public, write-only endpoint — the contact form posts here.

    Rate-limited per client (see REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['leads'])
    because it's the only anonymous write path and an obvious spam target."""

    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "leads"
    http_method_names = ["post", "options"]
