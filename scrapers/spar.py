"""Skraper for Spar — meieri/melk.

Spar deler API med Meny via NorgesGruppens dataplatform — eneste forskjellene er
kjede-ID (1210 = Spar), GLN for anonym bruker, og at Spar staver kategorinavnet
"Meieri og egg" mens Meny bruker "Meieri & egg".
"""

from decimal import Decimal

import httpx

from db import (
    connect,
    get_store_id,
    find_or_create_product,
    upsert_listing,
    insert_price_snapshot,
)
from normalize import normalize_name, categorize


API_URL = "https://platform-rest-prod.ngdata.no/api/products/1210/7080001097950"
CATEGORY_FACET = "Categories:Meieri og egg;ShoppingListGroups:Melk"
PAGE_SIZE = 48

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Referer": "https://spar.no/",
    "Origin": "https://spar.no",
    "fwc-chain-id": "1210",
    "fwc-using-bearer-token": "false",
    "fwc-using-api-key": "false",
    "content-type": "application/json",
}


def fetch_products() -> list[dict]:
    all_items: list[dict] = []
    with httpx.Client(timeout=30.0, headers=HEADERS) as client:
        page = 1
        while True:
            params = {
                "page": page,
                "page_size": PAGE_SIZE,
                "full_response": "true",
                "fieldset": "maximal",
                "facet": CATEGORY_FACET,
                "showNotForSale": "true",
            }
            r = client.get(API_URL, params=params)
            r.raise_for_status()
            data = r.json()

            hits_wrapper = data.get("hits")
            if isinstance(hits_wrapper, dict):
                total = hits_wrapper.get("total", 0)
                items = hits_wrapper.get("hits", [])
            else:
                total = data.get("total", 0)
                items = hits_wrapper or []

            sources = [it.get("_source", it) for it in items]
            all_items.extend(sources)

            if len(all_items) >= total or not items:
                break
            page += 1

    return all_items


def parse_product(src: dict) -> dict:
    ean = src.get("ean") or ""
    brand = (src.get("brand") or "").strip()
    title = (src.get("title") or "").strip()
    subtitle = (src.get("subtitle") or "").strip()

    sub = subtitle
    if brand:
        if sub.endswith(f" {brand}"):
            sub = sub[: -len(brand) - 1].strip()
        elif sub.startswith(f"{brand} "):
            sub = sub[len(brand) + 1 :].strip()

    display_parts = [p for p in (brand, title) if p]
    display = " ".join(display_parts)
    if sub:
        display = f"{display}, {sub}"

    raw_unit = src.get("measurementType")
    raw_value = src.get("measurementValue")
    size: Decimal | None = None
    unit: str | None = raw_unit
    if raw_value is not None:
        size = Decimal(str(raw_value))
        if unit == "ml":
            size = size / Decimal("1000")
            unit = "l"
        elif unit == "g" and size >= 1000:
            size = size / Decimal("1000")
            unit = "kg"

    price = Decimal(str(src["pricePerUnit"]))
    price_per_unit = (
        Decimal(str(src["comparePricePerUnit"]))
        if src.get("comparePricePerUnit") is not None
        else None
    )

    campaign_price = None
    campaign_text = None
    if src.get("usesPromotionPrice") and src.get("promotions"):
        promo = src["promotions"][0]
        promo_price = promo.get("promoPricePerUnit") or promo.get("unitPrice")
        if promo_price is not None:
            campaign_price = Decimal(str(promo_price))
        campaign_text = src.get("promotionDisplayName") or promo.get("displayName")

    image_url = None
    if src.get("imagePath"):
        image_url = f"https://bilder.ngdata.no/{src['imagePath']}/large.jpg"

    slug = src.get("slugifiedUrl") or ""
    url = f"https://spar.no/varer{slug}" if slug else None

    return {
        "store_sku": ean,
        "name_raw": display,
        "name_norm": normalize_name(display),
        "url": url,
        "image_url": image_url,
        "unit": unit,
        "size": size,
        "price": price,
        "price_per_unit": price_per_unit,
        "campaign_price": campaign_price,
        "campaign_text": campaign_text,
        "gtin": ean or None,
    }


def main() -> None:
    conn = connect()
    store_id = get_store_id(conn, "spar")

    raw_items = fetch_products()
    print(f"Fant {len(raw_items)} produkter fra Spar (melk).")

    for src in raw_items:
        p = parse_product(src)
        product_id = find_or_create_product(conn, p["name_norm"], categorize(p["name_norm"]), p["gtin"])
        listing_id = upsert_listing(
            conn,
            store_id=store_id,
            store_sku=p["store_sku"],
            product_id=product_id,
            name_raw=p["name_raw"],
            url=p["url"],
            image_url=p["image_url"],
            unit=p["unit"],
            size=p["size"],
        )
        insert_price_snapshot(
            conn,
            listing_id=listing_id,
            price=p["price"],
            price_per_unit=p["price_per_unit"],
            campaign_price=p["campaign_price"],
            campaign_text=p["campaign_text"],
        )

    conn.commit()
    conn.close()
    print(f"Lagret {len(raw_items)} produkter.")


if __name__ == "__main__":
    main()
