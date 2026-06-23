from __future__ import annotations

import csv
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Портрет аудитории" / "reviews_magnat_202606182208.csv"
IMAGE_SOURCE = ROOT / "Портрет аудитории" / "Картинка.png"
ASSET_DIR = ROOT / "public" / "assets" / "audience"
OUTPUT = ROOT / "public" / "data" / "audience-portrait.json"

CATEGORY_RULES = [
    (
        "Дети и семья",
        r"детск|ребен|ребён|подгуз|игруш|школ|малыш|пеленк|коляск|раскраск|фрутонян|агуш|соска|пазл",
    ),
    (
        "Зоотовары",
        r"кошач|кошк|котят|коту|кота|собак|животн|зоотовар|наполнитель|лакомство для|pro plan|cat step",
    ),
    (
        "Мороженое и сладости",
        r"морожен|эскимо|пинта|пломбир|рожок|шоколад|конфет|десерт|зефир|пастил|вафл|пирожн|сгущ|трюфел|печень|мармелад|торт|булоч|плюшк|крем-брюле",
    ),
    (
        "Fresh-продукты и готовка",
        r"батон|хлеб|картоф|укроп|зелень|молоко|йогурт|банан|лимон|сахар|масло|яйц|мука|лук|огурц|кабач|морков|творог|сметан|кефир|фарш|колбас|томат|виноград|капуст|чеснок|сыр|круп|соус|мяс|рыб|куриц|курин|овощ|фрукт|гречк|чай|напит|ряженк|бедро|котлет|петелинк|каша",
    ),
    (
        "Дом и быт",
        r"туалет|бумаг|средств|чист|ковр|текстил|кухн|посуд|стир|уборк|мебел|салфет|пятновывод|губк|пакет|контейнер|перчатк|полотенц",
    ),
    (
        "Красота и уход",
        r"крем|шампун|маск|космет|уход|волос|парфюм|гель|мыл|дезодорант|зубн|паста зуб|ватн|для кожи",
    ),
    (
        "Одежда и обувь",
        r"футбол|кроссов|сапог|куртк|плать|носк|обув|ботин|брюк|джинс|рубаш|шапк",
    ),
    (
        "Спорт и отдых",
        r"мяч|спортив|поход|рыбал|туризм|тренаж|самокат|велосипед|фитнес|коврик для",
    ),
    (
        "Техника и электроника",
        r"диск|телефон|смартфон|кабел|заряд|наушн|техник|электр|термостат|ламп|батарей",
    ),
    ("Авто", r"авто|машин|салон|шина|мотор"),
]

FEMALE_NAMES = {
    "алина",
    "алиса",
    "альбина",
    "амина",
    "анастасия",
    "ангелина",
    "анна",
    "арина",
    "виктория",
    "галина",
    "дарья",
    "ева",
    "евгения",
    "екатерина",
    "елена",
    "елизавета",
    "иванна",
    "ирина",
    "карина",
    "лидия",
    "лилия",
    "марина",
    "мария",
    "мишель",
    "надежда",
    "наталья",
    "нина",
    "оксана",
    "ольга",
    "светлана",
    "татьяна",
    "эльвира",
    "эмина",
    "юлия",
    "яна",
    "inga",
    "natalya",
}

MALE_NAMES = {
    "алексей",
    "артем",
    "валерий",
    "виктор",
    "денис",
    "дмитрий",
    "илья",
    "павел",
    "руслан",
    "станислав",
    "степан",
    "чиро",
    "aleksey",
    "stas",
}


def percent(value: int | float, total: int | float) -> int:
    if not total:
        return 0
    return round((value / total) * 100)


def category_for(sku: str) -> str:
    text = sku.lower()
    for label, pattern in CATEGORY_RULES:
        if re.search(pattern, text, flags=re.IGNORECASE):
            return label
    return "Другое на Ozon"


def is_magnat(row: dict[str, str]) -> bool:
    text = f"{row['sku']} {row['link']}".lower()
    return "магнат" in text or "magnat" in text


def gender_from_name(name: str) -> str:
    normalized = name.lower().replace("ё", "е")
    tokens = [re.sub(r"[^a-zа-я-]", "", token) for token in normalized.split()]

    for token in tokens:
        if token in FEMALE_NAMES:
            return "female"
        if token in MALE_NAMES:
            return "male"

    if any(token.endswith(("ова", "ева", "ина", "ская")) for token in tokens):
        return "female"

    return "unknown"


def top_examples(counter: Counter[str], limit: int = 4) -> list[str]:
    return [sku for sku, _ in counter.most_common(limit)]


def main() -> None:
    with SOURCE.open("r", encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))

    for row in rows:
        row["stars"] = int(row.get("stars") or 0)

    users = sorted({row["user_name"] for row in rows})
    total_users = len(users)
    dated_rows = [row for row in rows if row.get("date")]
    magnat_rows = [row for row in rows if is_magnat(row)]
    other_rows = [row for row in rows if not is_magnat(row)]

    user_categories: dict[str, set[str]] = defaultdict(set)
    category_reviews: Counter[str] = Counter()
    category_examples: dict[str, Counter[str]] = defaultdict(Counter)

    for row in other_rows:
        category = category_for(row["sku"])
        user_categories[row["user_name"]].add(category)
        category_reviews[category] += 1
        category_examples[category][row["sku"]] += 1

    category_user_counts = Counter(
        category for categories in user_categories.values() for category in categories
    )

    category_mix = [
        {
            "label": label,
            "count": count,
            "share": percent(count, total_users),
            "reviews": category_reviews[label],
            "examples": top_examples(category_examples[label]),
        }
        for label, count in category_user_counts.most_common()
        if label != "Другое на Ozon"
    ][:8]

    genders = Counter(gender_from_name(user) for user in users)
    known_gender_count = genders["female"] + genders["male"]
    female_share = percent(genders["female"], known_gender_count)

    category_share = {item["label"]: item["share"] for item in category_mix}
    category_count = {item["label"]: item["count"] for item in category_mix}

    fresh_share = category_share.get("Fresh-продукты и готовка", 0)
    sweets_share = category_share.get("Мороженое и сладости", 0)
    home_share = category_share.get("Дом и быт", 0)
    beauty_share = category_share.get("Красота и уход", 0)
    family_share = category_share.get("Дети и семья", 0)
    pets_share = category_share.get("Зоотовары", 0)

    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    image_path = ASSET_DIR / "portrait.png"
    shutil.copyfile(IMAGE_SOURCE, image_path)

    data = {
        "id": "audience-portrait",
        "title": "Портрет аудитории Магнат на Ozon",
        "description": (
            "Срез по авторам отзывов: какие другие товары покупают пользователи "
            "и что это говорит об их сценариях потребления."
        ),
        "source": "Портрет аудитории/reviews_magnat_202606182208.csv",
        "period": f"{min(row['date'] for row in dated_rows)} — {max(row['date'] for row in dated_rows)}",
        "image": "/assets/audience/portrait.png",
        "metrics": [
            {
                "label": "Авторы",
                "value": f"{total_users}",
                "description": "уникальные пользователи в выгрузке",
            },
            {
                "label": "Другие покупки",
                "value": f"{len(other_rows):,}".replace(",", " "),
                "description": "отзывов без товаров Магнат",
            },
            {
                "label": "Fresh-корзина",
                "value": f"{fresh_share}%",
                "description": "авторов покупают продукты для дома и готовки",
            },
            {
                "label": "Женские имена",
                "value": f"{female_share}%",
                "description": f"среди {known_gender_count} авторов с распознаваемыми именами",
            },
        ],
        "profileSignals": [
            {
                "title": "Пол по именам",
                "value": f"{female_share}%",
                "text": (
                    f"{genders['female']} из {known_gender_count} распознаваемых профилей выглядят женскими, "
                    f"{genders['male']} - мужскими; {genders['unknown']} профилей оставлены как неопределенные."
                ),
            },
            {
                "title": "Есть семейный след",
                "value": f"{family_share}%",
                "text": (
                    f"{category_count.get('Дети и семья', 0)} авторов покупали детские или семейные товары. "
                    "Это не главный кластер, но он подтверждает сценарий покупки десерта для дома."
                ),
            },
            {
                "title": "Домашнее пополнение",
                "value": f"{fresh_share}%",
                "text": (
                    "База аудитории регулярно покупает хлеб, молоко, яйца, овощи, йогурты и другие продукты "
                    "из повседневной корзины."
                ),
            },
            {
                "title": "Потребность в удовольствии",
                "value": f"{sweets_share}%",
                "text": (
                    "Помимо Магнат, в корзине заметны шоколад, зефир, вафли, пирожные и другое мороженое: "
                    "аудитория уже покупает десертные поводы на маркетплейсе."
                ),
            },
        ],
        "categoryMix": category_mix,
        "lifestyleInsights": [
            {
                "title": "Любят готовить и держать дома базовый запас",
                "text": (
                    f"Fresh-продукты встречаются у {fresh_share}% аудитории: хлеб, молоко, яйца, овощи, "
                    "фарш и кисломолочные продукты. Магнат логично ставить рядом со сценарием домашнего заказа."
                ),
            },
            {
                "title": "Покупают сладкое как регулярное удовольствие",
                "text": (
                    f"Сладости и мороженое без учета Магнат есть у {sweets_share}% авторов. "
                    "Это не разовый импульс, а привычная часть корзины: десерт после еды, гостевой запас, вечерний перекус."
                ),
            },
            {
                "title": "Заняты домом, уходом и заботой",
                "text": (
                    f"Дом и быт есть у {home_share}% авторов, красота и уход - у {beauty_share}%, "
                    f"зоотовары - у {pets_share}%. Аудитория решает бытовые задачи в одном заказе и ценит удобство."
                ),
            },
            {
                "title": "Семейность есть, но ее не стоит переоценивать",
                "text": (
                    f"Прямые детские товары встречаются у {family_share}% авторов. Поэтому коммуникация может "
                    "поддерживать семейный десерт, но ядро шире: это покупатели домашней fresh-корзины."
                ),
            },
        ],
        "watchouts": [
            "показывать Магнат как часть регулярного fresh-заказа, а не отдельную редкую покупку",
            "делать акцент на домашнем десерте, вечернем удовольствии и запасе для гостей",
            "сохранять рациональный слой коммуникации: доставка, форма продукта и удобство получения",
        ],
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    print(
        f"Users={total_users}; other_reviews={len(other_rows)}; "
        f"fresh={fresh_share}%; sweets={sweets_share}%; female_known={female_share}%"
    )


if __name__ == "__main__":
    main()
