"""Skraper for Oda — meieri/melk.

Strategi: Henter HTML-siden, leser Next.js-state fra <script id="__NEXT_DATA__">.
Mer robust enn å treffe /_next/data/{BUILD_ID}/... direkte, fordi build-ID-en
endres hver gang Oda deployer.
"""

import json
import re

import httpx

from db import (
    connect,
    get_store_id,
    find_or_create_product,
    upsert_listing,
    insert_price_snapshot,
)
from normalize import normalize_name, parse_price, extract_size_and_unit, categorize


CATEGORY_URL = "https://oda.com/no/categories/1283-meieri-ost-og-egg/49-melk/"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def fetch_products() -> list[dict]:
    with httpx.Client(timeout=30.0, headers={"User-Agent": USER_AGENT}, follow_redirects=True) as client:
        r = client.get(CATEGORY_URL)
        r.raise_for_status()

    match = re.search(
        r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',
        r.text,
        re.DOTALL,
    )
    if not match:
        raise RuntimeError("Fant ikke __NEXT_DATA__ i HTML-en. Oda har kanskje endret sideoppsettet.")

    data = json.loads(match.group(1))
    queries = data["props"]["pageProps"]["dehydratedState"]["queries"]

    for q in queries:
        key = q.get("queryKey")
        if not isinstance(key, list) or not key:
            continue
        first = key[0]
        if isinstance(first, dict) and first.get("_id") == "sectionListing":
            items = q["state"]["data"]["pages"][0]["items"]
            return [it["attributes"] for it in items if it.get("type") == "product"]

    raise RuntimeError("Fant ikke sectionListing-query i dehydratedState.")


def parse_product(attrs: dict) -> dict:
    # Oda gir oss tre navnevarianter:
    #   name:      "Tine Lettmelk"               (kort)
    #   fullName:  "Tine Lettmelk 0,5% fett"     (med fett-prosent)
    #   nameExtra: "0,5% fett, 1,75 l"           (fett + størrelse)
    # Beste display-navn er name + nameExtra, slik at størrelse er med og ingenting er duplisert.
    short_name = attrs.get("name") or attrs["fullName"]
    name_extra = attrs.get("nameExtra") or ""
    display_name = f"{short_name}, {name_extra}".strip(", ").strip()

    size, unit = extract_size_and_unit(name_extra or display_name)

    image_url = None
    if attrs.get("images"):
        image_url = attrs["images"][0].get("large", {}).get("url")

    promotion = attrs.get("promotion")
    campaign_price = None
    campaign_text = None
    if promotion:
        price_val = promotion.get("price") or promotion.get("grossPrice")
        if price_val:
            campaign_price = parse_price(price_val)
        campaign_text = promotion.get("description") or promotion.get("title") or promotion.get("label")

    price_per_unit = None
    if attrs.get("grossUnitPrice"):
        price_per_unit = parse_price(attrs["grossUnitPrice"])

    return {
        "store_sku": str(attrs["id"]),
        "name_raw": display_name,
        "name_norm": normalize_name(display_name),
        "url": attrs.get("frontUrl"),
        "image_url": image_url,
        "unit": unit,
        "size": size,
        "price": parse_price(attrs["grossPrice"]),
        "price_per_unit": price_per_unit,
        "campaign_price": campaign_price,
        "campaign_text": campaign_text,
        "gtin": None,
    }


def main() -> None:
    conn = connect()
    store_id = get_store_id(conn, "oda")

    raw_items = fetch_products()
    print(f"Fant {len(raw_items)} produkter fra Oda (melk).")

    for attrs in raw_items:
        p = parse_product(attrs)
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
