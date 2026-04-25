"""Databasetilkobling og skrive-funksjoner for skraperne.

Kun rå SQL — ingen ORM. Alle funksjoner tar en åpen tilkobling som argument,
slik at én skrape-kjøring kan gjøre alt i én transaksjon.
"""

import os
from decimal import Decimal
from pathlib import Path

import psycopg
from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parent.parent


def connect():
    load_dotenv(PROJECT_ROOT / ".env.local")
    url = os.environ["DATABASE_URL"]
    # Supabase' tilkoblingspool støtter ikke prepared statements.
    return psycopg.connect(url, prepare_threshold=None)


def get_store_id(conn, slug: str) -> int:
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM store WHERE slug = %s", (slug,))
        row = cur.fetchone()
    if row is None:
        raise ValueError(f"Ukjent butikk: {slug}. Har du kjørt db/schema.sql?")
    return row[0]


def find_or_create_product(conn, name_norm: str, category: str | None, gtin: str | None) -> int:
    """Returner product_id for et kanonisk produkt. GTIN-match først, så navn.

    Hvis vi finner et produkt på navn og har en GTIN som mangler i databasen,
    fyller vi inn GTIN-en — da finner neste skraper produktet direkte på GTIN.
    """
    with conn.cursor() as cur:
        if gtin:
            cur.execute("SELECT id FROM product WHERE gtin = %s", (gtin,))
            row = cur.fetchone()
            if row:
                return row[0]

        cur.execute(
            "SELECT id, gtin FROM product WHERE name_norm = %s AND category IS NOT DISTINCT FROM %s",
            (name_norm, category),
        )
        row = cur.fetchone()
        if row:
            product_id, existing_gtin = row
            if gtin and not existing_gtin:
                cur.execute("UPDATE product SET gtin = %s WHERE id = %s", (gtin, product_id))
            return product_id

        cur.execute(
            "INSERT INTO product (gtin, name_norm, category) VALUES (%s, %s, %s) RETURNING id",
            (gtin, name_norm, category),
        )
        return cur.fetchone()[0]


def upsert_listing(
    conn,
    store_id: int,
    store_sku: str,
    product_id: int,
    name_raw: str,
    url: str | None,
    image_url: str | None,
    unit: str | None,
    size: Decimal | None,
) -> int:
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO listing
                (product_id, store_id, store_sku, name_raw, url, image_url, unit, size, last_seen_at)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (store_id, store_sku) DO UPDATE SET
                product_id   = EXCLUDED.product_id,
                name_raw     = EXCLUDED.name_raw,
                url          = EXCLUDED.url,
                image_url    = EXCLUDED.image_url,
                unit         = EXCLUDED.unit,
                size         = EXCLUDED.size,
                last_seen_at = NOW()
            RETURNING id
            """,
            (product_id, store_id, store_sku, name_raw, url, image_url, unit, size),
        )
        return cur.fetchone()[0]


def insert_price_snapshot(
    conn,
    listing_id: int,
    price: Decimal,
    price_per_unit: Decimal | None = None,
    campaign_price: Decimal | None = None,
    campaign_text: str | None = None,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO price_snapshot
                (listing_id, price, price_per_unit, campaign_price, campaign_text)
            VALUES
                (%s, %s, %s, %s, %s)
            """,
            (listing_id, price, price_per_unit, campaign_price, campaign_text),
        )
