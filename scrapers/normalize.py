"""Normaliseringsfunksjoner så samme produkt fra ulike butikker får lik name_norm."""

import re
from decimal import Decimal


# Merker som ikke skiller produkter fra hverandre og som fjernes for matching.
# Eksempel: både Oda og Meny kan hete "Tine Lettmelk 1L" → samme produkt.
GENERIC_BRANDS = {
    "tine",
    "q",
    "q-meieriene",
    "synnøve",
    "synnove",
    "first price",
    "eldorado",
    "coop",
    "prior",
}

# Ord som beskriver produktet men ikke skiller det — fjernes for matching
# slik at "Lettmelk 0,5% fett" (Oda) og "Lettmelk 0,5%" (Meny) blir like.
STOPWORDS = {"fett", "melk"}


def normalize_name(raw: str) -> str:
    """Normaliser et produktnavn så samme vare fra ulike butikker får samme streng.

    Steg-for-steg:
      1. Lowercase og konverter komma→punktum i tall ("1,75" → "1.75").
      2. Fjern %-tegn (tallet er nok: "0.5" fra "0.5%").
      3. Slå sammen tall + enhet uten mellomrom ("1 l" → "1l").
      4. Konverter ml og små g til liter/kg for sammenlignbarhet.
      5. Fjern overflødige desimaler: "1.0" → "1".
      6. Fjern merkenavn og stopwords.
      7. Bytt ut alt annet enn bokstaver/tall/mellomrom med mellomrom.
      8. Slå sammen duplikat-naboord: "biola biola" → "biola".
      9. Rydd whitespace.
    """
    s = raw.lower().strip()

    s = re.sub(r"(\d+),(\d+)", r"\1.\2", s)
    s = re.sub(r"(\d+(?:\.\d+)?)\s*%", r"\1", s)

    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*(liter|l)\b", r"\1l", s)
    s = re.sub(
        r"\b(\d+(?:\.\d+)?)\s*ml\b",
        lambda m: f"{float(m.group(1)) / 1000:g}l",
        s,
    )
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*(kilogram|kilo|kg)\b", r"\1kg", s)
    s = re.sub(
        r"\b(\d+(?:\.\d+)?)\s*(gram|g)\b",
        lambda m: (
            f"{float(m.group(1)) / 1000:g}kg" if float(m.group(1)) >= 1000
            else f"{m.group(1)}g"
        ),
        s,
    )
    s = re.sub(r"\b(\d+)\s*(stk|pk|pakke)\b", r"\1stk", s)
    s = re.sub(r"\b(\d+)\.0\b", r"\1", s)

    for brand in GENERIC_BRANDS:
        s = re.sub(rf"\b{re.escape(brand)}\b", "", s)
    for word in STOPWORDS:
        s = re.sub(rf"\b{re.escape(word)}\b", "", s)

    s = re.sub(r"[^a-zA-Z0-9æøå.\s]", " ", s)
    s = re.sub(r"\b(\w+)(\s+\1)+\b", r"\1", s)
    s = re.sub(r"\s+", " ", s).strip()

    return s


def categorize(name_norm: str) -> str:
    """Klassifiser produktet inn i en av de smale meieri-kategoriene.

    Rekkefølgen er viktig: yoghurt sjekkes før sjokolademelk fordi
    "biola e drikke kakao" skal være yoghurt, ikke sjokolademelk.
    Proteindrikker sjekkes før sjokolademelk fordi "yt proteinshake
    sjokolade" er en proteindrikke, ikke sjokolademelk.
    """
    s = name_norm.lower()
    if re.search(r"(syrnet|syrna|tjukk|kefir|yoghurtdrikk|biola e drikke)", s):
        return "syrnet"
    if re.search(r"(protein|propud|restitusjon|maxim)", s) or s.startswith("yt "):
        return "proteindrikker"
    if re.search(r"(sjokolade|sjokomelk|sjokomj|kakao|cocio|litago|milkshake)", s):
        return "sjokolademelk"
    return "melk"


def parse_price(raw: str | float | int) -> Decimal:
    """'kr 19,90' eller '19.90' eller 19.9 → Decimal('19.90')."""
    if isinstance(raw, (int, float)):
        return Decimal(str(raw))
    cleaned = re.sub(r"[^\d,.-]", "", str(raw))
    cleaned = cleaned.replace(",", ".")
    return Decimal(cleaned)


def extract_size_and_unit(raw: str) -> tuple[Decimal | None, str | None]:
    """Finn '1l', '500g', '6stk' e.l. i produktnavnet. Returner (size, unit)."""
    match = re.search(r"(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml|stk)\b", raw.lower())
    if not match:
        return None, None
    size = Decimal(match.group(1).replace(",", "."))
    unit = match.group(2)
    return size, unit
