# LIVE-DEPLOY.md — Runbook for produksjons-deploy

Kort, klar oppskrift for å sette prissammenligner live på Vercel + Supabase, slik at den kan stå uten manuelt vedlikehold i ~1 år.

Stack: Next.js 16 (Vercel), Supabase Postgres (database), GitHub Actions cron (skraperne kjører hver 6. time).

---

## 1. Forutsetninger

- GitHub-repo: `deqa-jaja/prissammenligner` (branch `main` = prod, `dev` = arbeids-branch)
- Supabase-prosjekt med database og en gyldig **Transaction Pooler**-URL (port `6543`)
- GitHub CLI (`gh`) innlogget som `deqa-jaja`
- Vercel CLI installert lokalt (`npm install -g vercel` — allerede gjort)

---

## 2. Env vars som brukes i prod

Kun én env var trengs:

| Navn | Hvor brukes den | Form |
| --- | --- | --- |
| `DATABASE_URL` | `app/lib/db.js` (Next.js) **og** `scrapers/db.py` (Python via GitHub Actions) | `postgresql://postgres.<prosjekt-ref>:<passord>@aws-0-eu-north-1.pooler.supabase.com:6543/postgres` |

Viktig: Bruk **Transaction Pooler-URL (port 6543)**, ikke Direct (port 5432). Pooler-URL skalerer mye bedre for serverless miljø som Vercel. Koden i `app/lib/db.js` setter allerede `prepare: false`, som er kravet for PgBouncer transaction mode.

> Du finner pooler-URL i Supabase → Project Settings → Database → Connection string → **Transaction**.

---

## 3. Manuelle steg for å gå live

### 3.1 Sett GitHub Actions-secret (for scraper-cron)

```bash
gh secret set DATABASE_URL -R deqa-jaja/prissammenligner
# Lim inn pooler-URL når den spør (skjules i terminalen)
```

Verifiser:
```bash
gh secret list -R deqa-jaja/prissammenligner
```
Skal vise `DATABASE_URL`.

### 3.2 Logg inn på Vercel

```bash
vercel login
```
Velg GitHub-login og autentiser i nettleseren.

### 3.3 Importer repo til Vercel

Enklest via Vercel-dashboard:
1. https://vercel.com/new
2. Velg "Import Git Repository" → `deqa-jaja/prissammenligner`
3. Framework Preset: Next.js (auto-detekteres)
4. Root Directory: `./`
5. Build Command: standard (`next build`)
6. **Production Branch: `main`** (sjekkes/endres i Project Settings → Git)

### 3.4 Sett env var i Vercel

I Vercel-dashboard → Project Settings → Environment Variables:
- Name: `DATABASE_URL`
- Value: `postgresql://postgres.<...>:<passord>@aws-0-eu-north-1.pooler.supabase.com:6543/postgres`
- Environments: Production, Preview, Development (huk av alle tre)
- Save

### 3.5 Deploy

I dashboardet: "Deploy" eller fra CLI:
```bash
cd /Users/deqagesod/Documents/prissammenligner
vercel --prod
```

---

## 4. Verifiser at deploy fungerer

Etter deploy får du en URL som `https://prissammenligner-xxxx.vercel.app`:

1. Åpne forsiden — skal vise kategorier og priser
2. Åpne `<URL>/kategori/meieri` — skal vise produktrad med priser fra Oda/Meny/Spar
3. Åpne `<URL>/handleliste` — skal laste uten feil
4. Sjekk GitHub Actions:
   ```bash
   gh run list -R deqa-jaja/prissammenligner --workflow=scrape.yml
   ```
   Trigge en manuell kjøring for å bekrefte secret virker:
   ```bash
   gh workflow run scrape.yml -R deqa-jaja/prissammenligner
   gh run watch -R deqa-jaja/prissammenligner
   ```

Hvis kategori-siden er tom: scraperen har ikke kjørt ennå mot prod-DB. Trigge manuelt som over.

---

## 5. Anbefalt forbedring før deploy (ikke gjort enda)

**ISR-cache for å redusere DB-kostnad over 1 år.** I dag har alle sider `export const revalidate = 0`, som betyr at hver request går til Postgres. Det funker, men over et år genererer det mer trafikk enn nødvendig.

Forslag: endre til `export const revalidate = 60` (1 minutt cache) i:
- `app/page.js`
- `app/sok/page.js`
- `app/produkt/[id]/page.js`
- `app/kategori/[slug]/page.js`
- `app/tilbud/page.js`

Skraperne kjører kun hver 6. time, så 60s ISR-cache er trygt — data endrer seg ikke oftere uansett.

(Ikke endret enda — krever Deqas OK.)

---

## 6. Vedlikehold for å stå i 1 år

| Komponent | Krever fornyelse? | Når |
| --- | --- | --- |
| Vercel Free | Nei | Bygger automatisk, ingen tidsfrist |
| Supabase Free | Nei (men pauses ved 7 dager uten aktivitet) | Cron hver 6. time holder den aktiv |
| Supabase DB-passord | Potensielt årlig (best practice, ikke krav) | Roteres manuelt — oppdater både Vercel env og GH secret |
| GitHub token | Nei, secrets utgår ikke automatisk | — |
| Domener | Hvis du legger til custom domain | Ifølge registrar |

Free-tier kvoter å vite om:
- Vercel Hobby: 100 GB bandwidth/mnd, 100 GB-timer compute (mer enn nok for portefølje-trafikk)
- Supabase Free: 500 MB database, 2 GB bandwidth/mnd
- GitHub Actions Free: 2000 min/mnd (cron hver 6h × ~1 min = ~120 min/mnd, godt under)

---

## 7. Hvis noe knekker

Rull tilbake til forrige fungerende deploy:
```bash
vercel rollback
```
Eller velg en tidligere deploy i Vercel-dashboard → Deployments → "Promote to Production".

Hvis scraper-cron feiler:
```bash
gh run list -R deqa-jaja/prissammenligner --workflow=scrape.yml --limit 5
gh run view <run-id> -R deqa-jaja/prissammenligner --log
```

Hvis siden viser 500: åpne Vercel → Project → Logs. Vanligste årsak er at `DATABASE_URL` mangler eller peker på direct (port 5432) i stedet for pooler (6543).

---

## 8. Filer som rører deploy-konfigurasjonen

- `.github/workflows/scrape.yml` — cron for skraperne
- `scrapers/requirements.txt` — Python-deps som GitHub Actions installerer
- `app/lib/db.js` — Postgres-tilkobling i Next.js
- `package.json` — Next.js + React-versjoner
- `next.config.mjs` — tom config; Vercel auto-detekterer alt
