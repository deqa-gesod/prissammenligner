# Prissammenligner

Sammenligner priser på meieriprodukter fra Oda, Meny og Spar. Skrapere henter
priser hver 6. time og lagrer dem i Postgres. Frontend viser sammenligning per
produkt og en handleliste som regner ut hvilken butikk som er billigst for
akkurat din kurv.

**Live demo:** _(kommer — Vercel-URL legges inn etter deploy)_

## Skjermbilder

_Legg inn 3–4 skjermbilder her etter deploy:_

- Forside med kategorier og ukens tilbud
- Kategori-side med pris-tabell på tvers av butikkene
- Produkt-detaljside med 30-dagers prishistorikk
- Handleliste med "billigst totalt"-beregning

## Hvorfor

Privat sliter jeg alltid med å huske hvor melk og yoghurt er billigst.
Ville bygge et prosjekt som faktisk løser et reelt problem, og samtidig lære
meg Next.js, Postgres og web-skraping fra grunnen av.

## Stack

- **Next.js 16** (App Router) + Tailwind CSS for frontend
- **Supabase Postgres** med rå SQL via `postgres`-pakken (ingen ORM)
- **Python + httpx** for skraperne (Oda, Meny, Spar)
- **Vercel** for hosting
- **GitHub Actions** kjører skraperne på cron-schedule

## Lokal kjøring

```bash
# 1. Klone repo
git clone https://github.com/<brukernavn>/prissammenligner.git
cd prissammenligner

# 2. Sett opp DB
# Kjør innholdet i db/schema.sql i Supabase SQL Editor

# 3. Lag .env.local med din DATABASE_URL fra Supabase
echo "DATABASE_URL=postgresql://..." > .env.local

# 4. Start frontend
npm install
npm run dev
# → http://localhost:3000

# 5. (Valgfritt) Kjør skrapere lokalt
cd scrapers
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run_all.py
```

## Struktur

```
app/                 — Next.js sider og komponenter
  lib/               — DB-klient, format-helpers, kurv (localStorage)
  components/        — NavBar, PriceTable, AddToCartButton
  mockup/            — Tidlige design-mockups (Fase 2)
db/
  schema.sql         — Postgres-skjema (kjøres én gang i Supabase)
scrapers/
  oda.py meny.py spar.py  — Én skraper per butikk
  normalize.py       — Normaliser produktnavn så samme vare matches
  db.py              — DB-write-funksjoner
  run_all.py         — Kjører alle tre sekvensielt
.github/workflows/
  scrape.yml         — Cron som kjører run_all.py hver 6. time
```

## Status

Ferdig:
- Skrapere for Oda, Meny, Spar (kategori: meieri)
- Kategori-, søk-, produkt-, tilbud- og handleliste-sider
- Pris-historikk-graf siste 30 dager
- "Billigst per enhet"-sortering

Mangler / kjent rusk:
- Kun meieri-kategorier foreløpig (melk, syrnet, sjokolademelk, proteindrikker)
- Skrapere er fragile mot endringer i butikkenes API/HTML
- Ingen test-suite ennå
