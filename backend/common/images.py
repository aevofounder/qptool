"""
Авто-сжатие изображений при загрузке.

`compress_upload(field)` вызывается в save() моделей с ImageField: если в поле
лежит СВЕЖЕ загруженный файл (ещё не сохранён в хранилище), картинка
уменьшается до веб-размера и пережимается. Экономит место на диске и ускоряет
сайт, при этом качество для веба остаётся отличным.

- Уменьшает до MAX_SIDE по большей стороне (пропорции сохраняются).
- Фото → прогрессивный JPEG (quality 82). Картинки с прозрачностью (логотипы) →
  оптимизированный PNG, чтобы не потерять прозрачный фон.
- Учитывает EXIF-ориентацию (фото с телефона не будут «лежать на боку»).
- Уже сохранённые файлы и не-растровые форматы (SVG, PDF) не трогает.
"""
from io import BytesIO
import os

from django.core.files.base import ContentFile

try:
    from PIL import Image, ImageOps
except ImportError:  # Pillow должен быть установлен; без него — просто no-op
    Image = None

MAX_SIDE = 1600          # px по большей стороне
JPEG_QUALITY = 82        # баланс качество/вес
ALPHA_MODES = ("RGBA", "LA")


def _has_alpha(img):
    return img.mode in ALPHA_MODES or (img.mode == "P" and "transparency" in img.info)


def _process(field):
    """Вернуть (имя, ContentFile) с пережатой картинкой или None, если нечего/нельзя."""
    if Image is None:
        return None
    try:
        field.open()
        img = Image.open(field)
        img.load()
    except Exception:
        return None  # не растровое изображение (SVG и т.п.) или файл нечитаем

    try:
        img = ImageOps.exif_transpose(img)  # уважаем ориентацию из EXIF
    except Exception:
        pass

    img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)  # уменьшаем (не увеличиваем)

    buf = BytesIO()
    base = os.path.splitext(os.path.basename(field.name or "image"))[0] or "image"
    if _has_alpha(img):
        img = img.convert("RGBA")
        img.save(buf, format="PNG", optimize=True)
        new_name = base + ".png"
    else:
        img = img.convert("RGB")
        img.save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        new_name = base + ".jpg"
    return new_name, ContentFile(buf.getvalue())


def compress_upload(field):
    """Пережать поле, если в нём лежит свежая загрузка. Безопасно вызывать всегда."""
    # _committed == False → в поле новый файл, ещё не записанный в хранилище.
    if not field or getattr(field, "_committed", True):
        return
    try:
        result = _process(field)
    except Exception:
        result = None
    if result:
        name, content = result
        # save=False: пишем сжатый файл в хранилище, но не вызываем model.save() (без рекурсии)
        field.save(name, content, save=False)
