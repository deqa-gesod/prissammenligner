# Prissammenligner

A price tracker for Norwegian dairy products. It collects prices from three grocery stores - Oda, Meny and Spar - every six hours, stores them in Postgres, and shows you which store is cheapest for the exact basket you put together.

The idea came from a small everyday annoyance: I can never remember where milk and yoghurt are actually cheapest. So I built something that keeps track for me.

**Live demo:** [prissammenligner.vercel.app](https://prissammenligner.vercel.app/)

## What it does

- Scrapes dairy prices from Oda, Meny and Spar on a schedule
- Matches the same product across stores even when the names differ slightly
- Shows a price table per category so you can compare stores side by side
- Keeps a 30-day price history per product
- Lets you build a shopping list and tells you which single store gives the lowest total

## How the data side works

This is the part I spent the most time on, and it is where the project earns its keep.

**Collecting.** One Python scraper per store (`oda.py`, `meny.py`, `spar.py`) pulls product data over `httpx`. `run_all.py` runs all three in sequence. If one store fails the others still run and their data is saved; the job is only marked as failed when all three fail, so a single blocked store (Oda blocks GitHub Actions' datacenter IPs, for instance) doesn't bury real problems.

**Matching across stores.** The hard problem is that the same carton of milk is named differently everywhere. "Tine Lettmelk 1L" in one store, "Lettmelk 0,5% 1 liter" in another. `normalize.py` turns raw names into a comparable key: it lowercases, converts units (ml to l, g to kg), strips percentage signs and generic brand names, collapses duplicate words, and so on. Two listings with the same normalized name are treated as the same product. It also classifies each item into a narrow category (plain milk, cultured milk, chocolate milk, protein drinks), where the rule order matters: a protein shake that happens to be chocolate-flavoured should land in protein drinks, not chocolate milk.

**Storing.** The schema separates three things on purpose:

- `product` - one row per real-world product (the normalized identity)
- `listing` - that product as sold in a specific store (SKU, raw name, size, unit)
- `price_snapshot` - a timestamped price reading, so history accumulates instead of being overwritten

That last table is what makes the 30-day history and the "cheapest right now" queries possible. Every scrape appends snapshots rather than replacing the current price.

## Stack

- **Next.js 16** (App Router) and Tailwind CSS for the frontend
- **Supabase Postgres**, queried with raw SQL through the `postgres` package, no ORM
- **Python + httpx** for the scrapers
- **GitHub Actions** to run the scrapers on a cron schedule
- **Vercel** for hosting

## Running it locally

```bash
# 1. Clone the repo
git clone https://github.com/<username>/prissammenligner.git
cd prissammenligner

# 2. Set up the database
# Run the contents of db/schema.sql in the Supabase SQL Editor

# 3. Create .env.local with your DATABASE_URL from Supabase
echo "DATABASE_URL=postgresql://..." > .env.local

# 4. Start the frontend
npm install
npm run dev
# → http://localhost:3000

# 5. (Optional) Run the scrapers locally
cd scrapers
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run_all.py
```

## Project structure

```
app/                 Next.js pages and components
  lib/               DB client, formatting helpers, cart (localStorage)
  components/        NavBar, PriceTable, AddToCartButton
  mockup/            Early design mockups
db/
  schema.sql         Postgres schema (run once in Supabase)
scrapers/
  oda.py meny.py spar.py  One scraper per store
  normalize.py       Normalizes product names so the same item matches across stores
  db.py              DB write functions
  run_all.py         Runs all three scrapers in sequence
.github/workflows/
  scrape.yml         Cron that runs run_all.py every 6 hours
```

## What works

- Scrapers for Oda, Meny and Spar, covering the dairy category
- Category, search, product, offers and shopping-list pages
- 30-day price history graph per product
- "Cheapest per unit" sorting

## Known limits and next steps

- Only dairy categories so far: milk, cultured milk, chocolate milk and protein drinks
- The scrapers are fragile. If a store changes its API or HTML, they break, which is the usual cost of scraping sites that do not offer a stable public feed
- No test suite yet. The name-normalization logic is the obvious first thing to cover, since it has clear inputs and expected outputs

If I kept going, the priorities would be tests around `normalize.py`, broader categories, and making each scraper fail more gracefully when a store's layout shifts.
