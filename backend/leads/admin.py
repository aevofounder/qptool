from django.contrib import admin

from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "source", "status", "created_at")
    list_filter = ("status", "source", "created_at")
    list_editable = ("status",)
    search_fields = ("name", "phone", "email", "message")
    date_hierarchy = "created_at"
    autocomplete_fields = ("related_product",)
    readonly_fields = ("created_at", "page_url", "source", "related_product")
    actions = ["mark_in_progress", "mark_done", "mark_spam"]
    fieldsets = (
        ("Заявка", {"fields": ("name", "phone", "email", "message")}),
        ("Статус", {"fields": ("status",)}),
        (
            "Контекст",
            {
                "fields": ("source", "related_product", "page_url", "consent", "created_at"),
            },
        ),
    )

    @admin.action(description="Отметить «В работе»")
    def mark_in_progress(self, request, queryset):
        queryset.update(status=Lead.Status.IN_PROGRESS)

    @admin.action(description="Отметить «Обработана»")
    def mark_done(self, request, queryset):
        queryset.update(status=Lead.Status.DONE)

    @admin.action(description="Отметить «Спам»")
    def mark_spam(self, request, queryset):
        queryset.update(status=Lead.Status.SPAM)

    def has_add_permission(self, request):
        # Leads arrive only through the public API / form.
        return False
