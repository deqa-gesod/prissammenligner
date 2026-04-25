# Prissammenligner — Design System

Soft minimalistisk feminint uttrykk. Referanser: Glossier, Rhode, Studio Aster, Omma.
Cream base, dusty pink aksent, italic serif + sans-hybrid.

## Fargepalett

### Grunnpalett (brand/overflate/tekst)

| Rolle | Tailwind | Hex |
|---|---|---|
| Hoved-bakgrunn | `bg-cream` | `#F5EDDD` |
| Kort/sekundærflate | `bg-blush-50` | `#FBF5EE` |
| Aksent (brand) | `bg-rose-dusty` | `#D9A5A5` |
| Aksent lett | `bg-rose-mist` | `#F0DFD2` |
| Primær tekst | `text-ink` | `#2D2623` |
| Sekundær tekst | `text-mocha` | `#8B7B6F` |

### Funksjonelle farger (pris-status, ikon-aksent)

Støvete, aldri neon. Alltid kombinert med symbol eller tekst — ikke farge alene.

| Rolle | Tailwind | Hex | Brukes på |
|---|---|---|---|
| Billigst / valgt butikk | `bg-mint-soft` | `#A8C9A3` | rad-bakgrunn + `✿` (rosa sparkle) |
| Kampanje/tilbud | `bg-peach-soft` | `#F4B892` | "✦ -20%"-badge |
| Kun hos X | `bg-lavender-soft` | `#C9B8DD` | italic "Kun hos…"-badge |
| Utility-ikoner | `bg-sky-soft` / `text-sky-soft` | `#B8D5E2` | søk, handleliste-ikon, hamburger, kjøp-pil |
| Ikke tilgjengelig | `text-stone-300` | — | `—` |

Alle funksjonsfarger brukes på `40%–60%` opacity for mykere uttrykk (f.eks. `bg-mint-soft/40`).

## Typografi

Hybrid: Geist Sans for body og data, Cormorant Garamond italic for overskrifter og aksenter.

| Rolle | Font | Størrelse/vekt |
|---|---|---|
| H1 | Cormorant Garamond italic | `text-5xl sm:text-6xl italic font-light` |
| H2 | Cormorant Garamond italic | `text-2xl italic` |
| Produktnavn | Geist Sans | `text-base font-medium` |
| Pris | Geist Sans | `text-base/xl font-semibold tabular-nums` |
| Metadata | Geist Sans | `text-sm text-mocha` |
| Inline aksent | Cormorant italic | `italic font-serif text-ink` |
| Small caps (kolonne-headers) | Geist Sans | `text-xs uppercase tracking-wider text-mocha` |

Fontvariabler er eksponert i `--font-sans`, `--font-serif`, `--font-mono` via
`app/layout.js`. I Tailwind-klasser: `font-sans` (default), `font-serif`, `font-mono`.

## Mikrodetaljer

- **Border-radius:** `rounded-xl` (12px) på kort, `rounded-full` på knapper og chips.
- **Skygge:** `style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}` — svært subtilt, rose-tint.
- **Border:** `border border-rose-mist` på kort og separatorer.
- **Sparkle:** `✿` i `text-rose-dusty` foran billigste pris.
- **Separator (seksjonsdel):** `<div class="h-px bg-rose-mist">` med italic label.
- **Whitespace:** minimum `p-6` på kort, `gap-6` mellom kort, `py-10 sm:py-16` på side.

## Responsive breakpoints

| Navn | Prefix | Bredde | Oppførsel |
|---|---|---|---|
| Mobil | `(ingen)` | <640px | 1 kolonne, filter i bottom-sheet (senere) |
| Tablet | `sm:` | ≥640px | 2 kolonner (kort) eller full tabell |
| Desktop | `lg:` | ≥1024px | 3 kolonner (kort) eller bred tabell |

Mobile-first: skriv for mobil uten prefix, legg på `sm:`/`lg:` når layout skal endres.

## Komponent-inventar

Filene ligger i [app/components/](app/components/). Alle er tomme skjeletter
per Fase 2 — full implementasjon kommer i Fase 7 basert på valgt mockup.

| Fil | Ansvar |
|---|---|
| [ProductRow.js](app/components/ProductRow.js) | Én produkt-rad (brukes i Mockup A) |
| [PriceCell.js](app/components/PriceCell.js) | Én pris med farge etter status |
| [CampaignBadge.js](app/components/CampaignBadge.js) | `-20% TILBUD`-badge i dusty peach |
| [OnlyInStoreBadge.js](app/components/OnlyInStoreBadge.js) | `Kun hos Oda`-badge i dusty lavender |
| [StoreLogo.js](app/components/StoreLogo.js) | Oda/Meny/Spar-merke (tekst nå, SVG senere) |
| [FilterBar.js](app/components/FilterBar.js) | Filter-chips + sort-dropdown |
| [SearchInput.js](app/components/SearchInput.js) | Søkefelt med pill-shape |
| [EmptyState.js](app/components/EmptyState.js) | Null treff-melding |
| [LoadingSkeleton.js](app/components/LoadingSkeleton.js) | Placeholder mens data lastes |

## Mockups (Fase 2 ferdig)

Valgt layout: **Mockup A — tabell**. Alle ruter ligger under `/mockup/`:

| Rute | Innhold |
|---|---|
| [/mockup](app/mockup/page.js) | Indeks med lenker til alle mockups |
| [/mockup/forside](app/mockup/forside/page.js) | Hero + ukens tilbud + kategori-grid |
| [/mockup/a](app/mockup/a/page.js) | Kategori-side (tabell, valgt design) |
| [/mockup/tilbud](app/mockup/tilbud/page.js) | Alle kampanjer som kort |
| [/mockup/produkt](app/mockup/produkt/page.js) | Produktdetalj + prishistorikk-graf + toast |
| [/mockup/handleliste](app/mockup/handleliste/page.js) | Kurv + butikk-velger (default = billigste) |
| [/mockup/kjop](app/mockup/kjop/page.js) | Kjøpsoversikt — `?store=` velger butikk |
| [/mockup/sok](app/mockup/sok/page.js) | Søkeresultat med treff-highlighting |
| [/mockup/handleliste-tom](app/mockup/handleliste-tom/page.js) | Tom-tilstand for kurven |
| [/mockup/sok-tom](app/mockup/sok-tom/page.js) | Tom-tilstand for søk |
| [/mockup/ikke-funnet](app/mockup/ikke-funnet/page.js) | 404-mockup |
| [/mockup/original-a](app/mockup/original-a/page.js) | Arkiv: original Mockup A (referanse) |
| [/mockup/b](app/mockup/b/page.js) | Arkiv: kort-layout (forkastet) |

Delte komponenter brukt på tvers:

- [/mockup/NavBar.js](app/mockup/NavBar.js) — sticky topbar med kategori-lenker, søk, kurv-ikon, mobil-drawer
- [/mockup/Footer.js](app/mockup/Footer.js) — copyright + ansvarsfraskrivelse
- [/mockup/AddToCartButton.js](app/mockup/AddToCartButton.js) — knapp + toast-bekreftelse
- [/mockup/NotFoundView.js](app/mockup/NotFoundView.js) — 404-visning (delt med [app/not-found.js](app/not-found.js))
- [/mockup/mock-data.js](app/mockup/mock-data.js) — hardkodet data for alle mockups

```bash
cd /Users/deqagesod/Documents/prissammenligner
npm run dev
# http://localhost:3000/mockup
```

## Designprinsipper (akseptkriterier)

Enhver ny komponent eller side må oppfylle:

1. Intuitivt — førstegangsbruker skjønner hovedfunksjonen uten forklaring
2. Effektivt — maks 2 klikk til "billigste pris for produkt X"
3. Lett å bruke — ingen skjulte knapper
4. Rent og estetisk — bare de støvete funksjonsfargene + brand-aksent
5. God informasjonsarkitektur — produktnavn + billigste pris dominerer
6. Logisk brukerflyt — søk → filter → resultat → detalj
7. Tydelig visuelt hierarki — pris > navn > metadata
8. Solid funksjonalitet — alltid tom/laste/feil-tilstand definert
9. Responsivt — fungerer under 640px og over 1024px

Og estetikk-kriteriene:

- [ ] Cream bakgrunn, ikke ren hvit
- [ ] Italic serif i overskrift
- [ ] Dusty pink som eneste brand-aksent
- [ ] Myknede funksjonsfarger (mint/peach/lavendel), ingen ren grønn/oransje
- [ ] `rounded-xl` på alle kort
- [ ] Sparkle `✿` markerer billigst (ikke checkmark)
- [ ] Minst 32px whitespace mellom kort

## Neste steg: Figma-dokumentasjon (etter Fase 7)

Når UI-et er bygd og live på Vercel:

1. Screenshots av produksjonsside (alle hovedflyter)
2. Figma-fil "Prissammenligner — Design System" med:
   - Color Styles: cream, rose-dusty, rose-mist, ink, mocha, mint-soft, peach-soft, lavender-soft
   - Text Styles: H1, H2, Produktnavn, Pris, Metadata
   - Component varianter: PriceCell (normal/billigst/kampanje), CampaignBadge, OnlyInStoreBadge
3. (Valgfritt) Figma Dev Mode for å koble komponenter mellom Figma og koden

Dette planlegges ikke i detalj nå — avsettes ~2 timer etter Fase 7.
