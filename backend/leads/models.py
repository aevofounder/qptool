from django.db import models


class Lead(models.Model):
    """A submission from the contact form / "Заказать консультацию" buttons."""

    class Source(models.TextChoices):
        CONTACT_FORM = "contact_form", "Форма контактов"
        CONSULTATION = "consultation", "Заказать консультацию"
        PRODUCT = "product", "Запрос цены (карточка товара)"
        SOLUTION = "solution", "Обсудить проект (решения)"
        OTHER = "other", "Другое"

    class Status(models.TextChoices):
        NEW = "new", "Новая"
        IN_PROGRESS = "in_progress", "В работе"
        DONE = "done", "Обработана"
        SPAM = "spam", "Спам"

    name = models.CharField("Имя", max_length=150)
    phone = models.CharField("Телефон", max_length=40)
    email = models.EmailField("E-mail", blank=True)
    message = models.TextField("Сообщение", blank=True)
    source = models.CharField(
        "Источник", max_length=20, choices=Source.choices, default=Source.CONTACT_FORM
    )
    status = models.CharField(
        "Статус", max_length=20, choices=Status.choices, default=Status.NEW
    )
    # Light context captured at submit time.
    related_product = models.ForeignKey(
        "catalog.Product",
        verbose_name="Связанный товар",
        related_name="leads",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    page_url = models.URLField("Страница отправки", blank=True)
    consent = models.BooleanField("Согласие на обработку ПДн", default=True)
    created_at = models.DateTimeField("Получена", auto_now_add=True)

    class Meta:
        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.phone}) — {self.get_status_display()}"
