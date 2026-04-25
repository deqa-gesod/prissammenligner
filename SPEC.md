# Prissammenligner — Funksjonell spec (MVP)

Dokumentet beskriver *hva* siden skal gjøre. Design-system og visuelle regler
ligger i [DESIGN.md](DESIGN.md). Visuell sannhet er wireframene under `/mockup/*`.

## Status (per 2026-04-25)

**Fase 2 (design + wireframes) er ferdig.** Alle skjermer er prototypet i
`/mockup/*` med riktig estetikk og mock-data. Designspråket er låst.

**Fase 7 (faktisk implementasjon) er neste.** Bytt ut mock-data med ekte
data fra Supabase, koble til scrapere som henter fra DB, deploy til Vercel.

Pekepinn for Fase 7-implementasjon:
- Bruk [app/mockup/a/page.js](app/mockup/a/page.js) som visuell mal for kategori-siden
- Bruk [app/mockup/forside/page.js](app/mockup/forside/page.js) som mal for `/`
- Bruk [app/mockup/produkt/page.js](app/mockup/produkt/page.js) som mal for `/produkt/[id]`
- Resten av rutene har 1:1 mockup i `/mockup/[ruten]`
- DB-skjema ligger i [db/schema.sql](db/schema.sql)
- Skraperne for meieri fungerer for alle tre butikker ([scrapers/oda.py](scrapers/oda.py), [scrapers/meny.py](scrapers/meny.py), [scrapers/spar.py](scrapers/spar.py)) og skriver til DB; de fem andre kategoriene må bygges

## Oppsummering

Prissammenligner viser priser fra Oda, Meny og Spar side om side. Brukere kan
bla gjennom 6 kategorier, se tilbud, søke globalt, klikke inn på et produkt
for prishistorikk, og samle en handleliste som regner ut totalsum per butikk.

Data hentes via Python-skrapere på GitHub Actions (hver 6. time) og lagres i
Supabase Postgres. Next.js-appen leser derfra. Ingen innlogging.

## Ruter / sidekart

| Rute | Innhold |
|---|---|
| `/` | Forside: hero + "Ukens største tilbud" + kategori-grid |
| `/kategori/[slug]` | Kategori-side: tabell-layout (Mockup A) + filter "Kun tilbud" + sortering |
| `/tilbud` | Alle produkter med kampanjepris, sortert etter størst rabatt |
| `/produkt/[id]` | Produktdetalj: bilde, priser per butikk, prishistorikk-graf, kampanjelogg |
| `/søk` | Søkeresultater (query-param `?q=...`), på tvers av alle kategorier |
| `/handleliste` | Oversikt: produktene du har lagt til, totalsum per butikk, **butikk-velger** (default = billigste) |
| `/handleliste/kjop?store=oda` | Kjøpsoversikt: ren liste der hvert produkt er klikkbart og åpner hos valgt butikk |
| `/404` (Next.js `not-found.js`) | Vises automatisk for ukjente URL-er. Bruker `NotFoundView` |
| (ingen `/om`) | Info om prosjektet ligger i `README.md` på GitHub |

## Navigasjon

**Horisontal topbar** (mobile-first → hamburger under 640px):

```
Prissammenligner   Meieri · Frukt · Kjøtt · Brød · Drikke · Snacks   Tilbud   [🔍 søk]   [🛒 n]
```

- Logo/navn til venstre → lenker til `/`
- Kategori-lenker (6 stk) med aktiv-indikator (dusty pink understrek)
- "Tilbud"-lenke til venstre for søk (oransje/peach hint-aksent)
- Søkefelt (ekspanderer ved klikk på mobil)
- Handleliste-ikon med antall-badge (viser tall når > 0)
- Aktiv kategori markeres med dusty pink underline

## Kategorier

MVP dekker 6 kategorier. Meieri eksisterer allerede:

| Slug | Navn | Emoji | Status |
|---|---|---|---|
| `meieri` | Meieri | 🥛 | Skraping fungerer for Oda, Meny og Spar |
| `frukt-gront` | Frukt & grønt | 🍎 | Skrapes |
| `kjott-fisk` | Kjøtt & fisk | 🥩 | Skrapes |
| `brod-bakeri` | Brød & bakeri | 🥐 | Skrapes |
| `drikke` | Drikke | 🧃 | Skrapes |
| `snacks` | Snacks & godteri | 🍫 | Skrapes |

## Funksjoner

### Forside `/`

**Seksjon 1: Hero**
- H1 italic serif "*Prissammenligner*"
- Undertittel: "Sammenlign priser fra Oda, Meny og Spar. Oppdateres hver 6. time."
- Stor søkefelt-chip (sekundær inngang til søk utenom topbaren)

**Seksjon 2: Ukens største tilbud**
- Tittel italic serif "*Ukens største tilbud*"
- Horisontal karusell/grid med 4–6 produktkort (ProductCard fra Mockup B brukes her, små versjon)
- Hvert kort: bilde, navn, ny pris, gammel pris overstrøket, rabatt-badge
- Lenke "Se alle tilbud →" til `/tilbud`

**Seksjon 3: Utforsk kategorier**
- Grid 2×3 på desktop, 2×3 eller 1-kol på mobil
- Hver kategori: stort emoji, navn i italic serif, antall produkter
- Klikk → `/kategori/[slug]`

(Ingen "Om"-seksjon på forsiden — ligger i `README.md` på GitHub og som
beskrivelse i porteføljen.)

### Kategori-side `/kategori/[slug]`

- H1 italic serif med kategorinavn
- Filter-chips: `Alle` · `Kun tilbud` · `Finnes i alle butikker`
- Sort-dropdown: `Alfabetisk` (default) · `Billigste pris` · `Størst rabatt`
- Tabell (Mockup A): kolonner = Produkt | Oda | Meny | Spar | Pris/enhet
- Billigste pris i hver rad får dusty mint-bakgrunn + sparkle `✿`
- Kampanje-rader får dusty peach-badge på produktnavn
- "Kun hos X"-rader får dusty lavender-badge

### Tilbud-side `/tilbud`

- H1 italic serif "*Ukens tilbud*"
- Samme tabell-layout som kategori, men filtrerer til `campaign_price IS NOT NULL`
- Tilleggs-kolonne eller -markering: rabatt i prosent
- Default-sortering: størst rabatt først
- Kategori-filter øverst: `Alle kategorier` · `Meieri` · `Frukt` · osv.

### Produktdetalj `/produkt/[id]`

- Tilbake-lenke øverst
- Venstre: stort produktbilde
- Høyre:
  - Navn (H1 italic serif)
  - Metadata (størrelse, enhet)
  - Priser per butikk (samme PriceCell-design som tabell, men større)
  - Pris per kg/L
  - Kampanje-tekst og -pris hvis aktiv
  - Knapp "Legg i handleliste"
  - Direktelenker til produktet hos Oda/Meny/Spar
- Prishistorikk-graf (full bredde):
  - Linje-graf, siste 30 dager
  - Én linje per butikk (Oda, Meny, Spar) i forskjellige dusty farger
  - Tooltip viser dato + pris på hover
  - Datakilde: `price_snapshot`-tabellen

### Søk `/søk?q=...`

- Samme tabell-layout som kategori
- Topbar søkefelt er persistert (viser current query)
- Ingen kategori-filter i første iterasjon — alle treff på tvers av kategorier
- Tom tilstand: "Ingen treff for *[q]*. Prøv et annet ord."
- Sort-muligheter: samme som kategori

### Handleliste `/handleliste`

- H1 italic serif "*Min handleliste*"
- Liste med produktene brukeren har lagt til (fra localStorage)
- For hvert produkt: bilde, navn, antall-justerer (–/+), fjern-knapp
- **Butikk-velger til høyre (sticky på desktop):**
  - Viser totalsum for Oda, Meny, Spar som klikkbare radio-rader
  - Default valgt = billigste (markert med rosa `✿`)
  - Bruker kan klikke en annen butikk → velger den
  - Valgt butikk: grønn (mint) border + grønn radio-prikk
  - Tekst under tilpasses: "Du sparer X kr" hvis billigste valgt, ellers "Du betaler X kr mer enn billigste"
  - Knappen "Klar til å handle hos [valgt butikk]? →" linker til `/handleliste/kjop?store={slug}`
  - Hvis et produkt ikke finnes i en butikk: lavendel-badge "Mangler N"
- Tom tilstand: stor `✿` + "Handlelista er tom" + knapper til forside og tilbud
- Data: localStorage-nøkkel `prissammenligner.handleliste`, format `[{product_id, quantity}]`

### Kjøpsoversikt `/handleliste/kjop?store=oda`

- Brukes når brukeren har valgt butikk og er klar til å handle
- H1 italic serif "*Klar til å handle hos {butikk}*"
- Mint-grønn pill med totalsum øverst (kun mint hvis billigste — ellers blush)
- Liste der hver rad er én klikkbar lenke som åpner produktet hos valgt butikk i ny fane
- Ingen sjekkboks-mekanikk (forenklet — bruker handler manuelt)
- Ingen tips-seksjon (forklaring ligger i selve teksten)
- "Bytt butikk"-seksjon nederst med lenker `/handleliste/kjop?store={annen}`

## Globale komponenter

For Fase 7-implementasjonen — start med å porte disse fra `/mockup/`-versjonene
til `app/components/` (eller behold delte under `app/_components/`):

- `NavBar` — sticky topbar, kategori-lenker, søk, handleliste-ikon, mobil-drawer (`/mockup/NavBar.js`)
- `Footer` — copyright + ansvarsfraskrivelse (`/mockup/Footer.js`)
- `AddToCartButton` — knapp + toast-bekreftelse (`/mockup/AddToCartButton.js`)
- `NotFoundView` — 404-visning (`/mockup/NotFoundView.js`, brukt av `app/not-found.js`)
- `HeroSection` — forsidens hero
- `CampaignCarousel` — "Ukens tilbud" på forsiden (DealCard fra forside-mockup)
- `CategoryGrid` — kategori-rutenett på forsiden
- `ProductRow` — tabell-rad (kategori, søk)
- `PriceCell` — én pris med tilstand (billigst/normal/kampanje/mangler)
- `CampaignBadge` — peach `✦ -X%`-badge
- `OnlyInStoreBadge` — lavender italic "Kun hos…"-badge
- `FilterBar` — filter-chips + sort-dropdown
- `SearchInput` — pill-shape søkefelt
- `ProductDetail` — produkt-side venstre/høyre layout
- `PriceHistoryChart` — SVG-linjer (mockup viser ferdig SVG-versjon, ingen ekstra dependency)
- `StoreSelectorCard` — radio-rad-velger på handlelisten
- `EmptyState` — gjenbrukes for tom handleliste, søk uten treff, etc.
- `LoadingSkeleton` — placeholder mens data lastes

## Footer

Én liten seksjon nederst på alle sider:

```
© 2026 Prissammenligner
Priser oppdateres hver 6. time. Studentprosjekt uten offisiell tilknytning til
Oda, Meny eller Spar.
```

Dusty pink border-top. Sentrert. Font: Geist sans, text-sm, text-mocha.

## Data-krav fra scrapere

For hvert produkt i hver kategori (per butikk):
- `store_sku` — butikkens ID
- `name_raw` — visningsnavn
- `name_norm` — normalisert for matching på tvers av butikker
- `url` — lenke til produktet hos butikken
- `image_url` — produktbilde
- `unit`, `size` — for pris per enhet
- `price`, `price_per_unit`
- `campaign_price`, `campaign_text` (hvis tilbud)
- `gtin` (hvis mulig) — hjelper matching

Eksisterende `price_snapshot`-tabell gir prishistorikk gratis. Ingen endring
i datamodell utover å legge kategori-koder på produkter.

## Avgrensninger (ikke med i MVP)

Disse kommer senere (Fase 12+):
- Favoritter (hjerte-ikon + /favoritter-side)
- Innlogging / brukerprofil
- Cross-device sync av handleliste
- Flere butikker enn Oda/Meny/Spar
- Søk-filter på kategori innenfor søkeresultater
- Push-varsling ved prisfall
- Prishistorikk lenger enn 30 dager i grafen
- Sammenlign-kurv som husker tidligere varianter
- "Om"-side på nettsiden (ligger i README.md på GitHub i stedet)

## Tekst-retningslinjer

- Norsk overalt, bokmål
- Italic serif for overskrifter og aksenter
- Kort, direkte setninger i body
- Aldri "klikk her" — alltid beskrivende lenketekst
- Priser: `24,90` (komma, to desimaler), `127,-` (når heltall, bindestrek med hyphen)

## Neste steg (etter at du har godkjent dette)

1. Jeg skriver en **implementeringsplan** for Fase 7 som bryter dette spec-et
   ned i konkrete steg med avhengigheter (hvilken side bygges først, osv.)
2. Vi bekrefter prioritering — typisk: navbar + forside + kategori-side først,
   deretter tilbud/søk/detalj, sist handleliste
3. Parallelt: skraperne for de fem nye kategoriene bygges ut fra eksisterende
   `oda.py`-mønster
4. Deploy til Vercel når hovedsiden er funksjonell
