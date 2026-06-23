from __future__ import annotations

import json
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Алгоритм покупки" / "ERW_0710_1500_Р_Ардалионов.pdf"
ASSET_DIR = ROOT / "public" / "assets" / "algorithm"
OUTPUT = ROOT / "public" / "data" / "algorithm-purchase.json"

PAGES_TO_EXPORT = [8, 9, 10, 12, 16, 17, 23, 25, 26, 27, 28, 29, 30]


def export_page_images() -> dict[int, str]:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    reader = PdfReader(str(SOURCE))
    exported: dict[int, str] = {}

    for page_number in PAGES_TO_EXPORT:
        page = reader.pages[page_number - 1]
        images = list(page.images)
        if not images:
            continue
        image = images[0]
        suffix = image.name.rsplit(".", 1)[-1].lower() if "." in image.name else "jpg"
        filename = f"algorithm-page-{page_number:02d}.{suffix}"
        path = ASSET_DIR / filename
        path.write_bytes(image.data)
        exported[page_number] = f"/assets/algorithm/{filename}"

    return exported


def main() -> None:
    pages = export_page_images()

    data = {
        "id": "algorithm",
        "title": "Алгоритмы покупки продуктов питания",
        "description": (
            "Исследование NTech показывает, что покупатель выбирает не только SKU: "
            "часто он закрывает задачу, ситуацию потребления или импульсный повод."
        ),
        "source": "Алгоритм покупки/ERW_0710_1500_Р_Ардалионов.pdf",
        "sourceUrl": "https://disk.360.yandex.ru/i/DRLua0js_EL-kQ",
        "hero": {
            "insight": "55% покупок - это покупка ситуации потребления",
            "note": (
                "Сигма-покупки занимают крупнейшую долю: пользователь готов менять "
                "категорию, если решение лучше закрывает конкретный сценарий."
            ),
        },
        "metrics": [
            {
                "label": "Сигма",
                "value": "54,3%",
                "description": "свободный выбор и замена между категориями",
            },
            {
                "label": "Бета",
                "value": "22,9%",
                "description": "конкретный SKU с ограниченным числом замен",
            },
            {
                "label": "Альфа",
                "value": "14,3%",
                "description": "конкретный SKU без рассмотрения замен",
            },
            {
                "label": "Омега",
                "value": "8,5%",
                "description": "импульс, подарок или покупка вкусняшки",
            },
        ],
        "algorithms": [
            {
                "key": "alpha",
                "title": "Альфа-покупки",
                "share": 14.3,
                "shortDefinition": "Конкретное SKU и никаких замен.",
                "description": (
                    "Покупатель заранее знает товар и не рассматривает близкие "
                    "альтернативы. Замена возможна только при явных недостатках "
                    "или отсутствии товара."
                ),
                "brandRole": "очень важен при первой покупке",
                "productRole": "максимально важен",
                "priceElasticity": "крайне низкая",
                "examples": [
                    "смеси молочные",
                    "корма для животных",
                    "энергетические напитки",
                    "детское питание",
                ],
                "sourcePage": 8,
                "image": pages[8],
            },
            {
                "key": "beta",
                "title": "Бета-покупки",
                "share": 22.9,
                "shortDefinition": "Ограниченное число альтернатив.",
                "description": (
                    "Намерение купить конкретный SKU сохраняется, но покупатель "
                    "готов рассмотреть небольшое число похожих замен внутри "
                    "категории или группы."
                ),
                "brandRole": "очень важен",
                "productRole": "достаточно важен",
                "priceElasticity": "очень высокая",
                "examples": ["сахар", "хлеб", "крупы", "молоко"],
                "sourcePage": 9,
                "image": pages[9],
            },
            {
                "key": "sigma",
                "title": "Сигма-покупки",
                "share": 54.3,
                "shortDefinition": "Свободный выбор под ситуацию потребления.",
                "description": (
                    "Покупатель хочет закрыть задачу, например ужин, перекус или "
                    "декларацию, и может перейти в соседнюю категорию, если она "
                    "лучше решает сценарий."
                ),
                "brandRole": "важен внутри решения",
                "productRole": "важен как вариант сценария",
                "priceElasticity": "средняя, зависит от задачи",
                "examples": [
                    "овощные консервы",
                    "пельмени",
                    "кисломолочные продукты",
                    "птица",
                ],
                "sourcePage": 12,
                "image": pages[12],
            },
            {
                "key": "omega",
                "title": "Омега-покупки",
                "share": 8.5,
                "shortDefinition": "Импульс, подарок или вкусняшка.",
                "description": (
                    "Покупка выходит за рамки регулярной корзины: человек берет "
                    "что-то для удовольствия, подарка или внезапного повода."
                ),
                "brandRole": "очень важен",
                "productRole": "очень важен",
                "priceElasticity": "относительно низкая",
                "examples": [
                    "икра",
                    "премиальная кондитерка",
                    "прохладительные напитки",
                    "морепродукты",
                ],
                "sourcePage": 10,
                "image": pages[10],
            },
        ],
        "categorySplit": {
            "category": "Мороженое в молочных продуктах",
            "alpha": 3,
            "beta": 59,
            "sigma": 16,
            "omega": 23,
            "sourcePage": 17,
        },
        "caseStudy": {
            "title": "В поисках ужина на сайте Магнита",
            "description": (
                "Путь пользователя показывает, где категорийная навигация не "
                "поддерживает ситуацию потребления."
            ),
            "steps": [
                {
                    "title": "Пользователь хочет именно ужин",
                    "text": "На главной полке Магнит предлагает перейти в стандартный магазин.",
                    "image": pages[25],
                    "sourcePage": 25,
                },
                {
                    "title": "Переход в раздел Все товары",
                    "text": "Вместо сценария ужина пользователь видит широкий каталог и лишние категории.",
                    "image": pages[26],
                    "sourcePage": 26,
                },
                {
                    "title": "Попытка найти готовую еду",
                    "text": "Категория помогает частично, но выдает воду и пиццу как скучное меню.",
                    "image": pages[27],
                    "sourcePage": 27,
                },
                {
                    "title": "Поиск по слову ужин",
                    "text": "Выдача находит 201 товар, но релевантность сценария остается смешанной.",
                    "image": pages[28],
                    "sourcePage": 28,
                },
                {
                    "title": "Контрастный пример Самоката",
                    "text": "Даже у конкурента запрос ужин может давать шумную выдачу, значит возможность шире рынка.",
                    "image": pages[29],
                    "sourcePage": 29,
                },
            ],
        },
        "opportunities": [
            "Предложить широкий репертуар удобных решений",
            "Разместить один и тот же продукт на максимальном количестве полок",
            "Открыть новые возможности для поставщиков",
            "Создать новые возможности для онлайн-торговли",
        ],
        "evidence": [
            {"title": "Как люди выбирают продукты", "image": pages[16], "sourcePage": 16},
            {"title": "Мороженое в молочной категории", "image": pages[17], "sourcePage": 17},
            {"title": "Покупка ситуации потребления", "image": pages[23], "sourcePage": 23},
            {"title": "Потенциал онлайна", "image": pages[30], "sourcePage": 30},
        ],
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
