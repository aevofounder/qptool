from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("leads", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="lead",
            name="source",
            field=models.CharField(
                choices=[
                    ("contact_form", "Форма контактов"),
                    ("consultation", "Заказать консультацию"),
                    ("product", "Запрос цены (карточка товара)"),
                    ("solution", "Обсудить проект (решения)"),
                    ("inquiry_spec", "Спецификация (запрос цены)"),
                    ("other", "Другое"),
                ],
                default="contact_form",
                max_length=20,
                verbose_name="Источник",
            ),
        ),
    ]
