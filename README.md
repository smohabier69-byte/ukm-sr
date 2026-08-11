# UKM.sr — Webshop demo

Een premium e-commerce demonstratie voor **UKM.sr** (Utsukushiku Kenkona Me — *Mooie, gezonde ogen*),
opticien aan de Rembrandtstraat #84 in Paramaribo.

De volledige interface is Nederlandstalig, met Surinaamse conventies: prijzen als `SRD 695,-`,
decimale komma, datums `dd-mm-jjjj` en 10% BTW.

> Deze website is een demonstratie. Bestellen en betalen werken echt, maar lopen tegen een
> **Square sandbox-account** aan — er wordt geen echt geld verwerkt.

## Starten

```bash
npm install
npm run dev
```

De site draait daarna op <http://localhost:3000>. Nodig in `.env.local`: `DATABASE_URL`,
`AUTH_SECRET`, `RESEND_API_KEY`, `SQUARE_ACCESS_TOKEN`, `SQUARE_ENVIRONMENT`,
`SQUARE_LOCATION_ID`, `SQUARE_WEBHOOK_SIGNATURE_KEY` — zie `.env.example`.

| Script | Doel |
| --- | --- |
| `npm run dev` | Ontwikkelserver met Turbopack |
| `npm run build` | Productiebuild |
| `npm run start` | Productiebuild serveren |
| `npm run lint` | ESLint |

Het project draait zonder aanpassingen op Vercel. Stel eventueel `NEXT_PUBLIC_SITE_URL`
in op het uiteindelijke domein, zodat canonical-URL's en Open Graph-afbeeldingen kloppen.

## Techniek

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · Lucide

## Paginas

**Winkel** — Home · Alle producten · Categorie · Merken en merkdetail · Aanbiedingen ·
Productdetail · Zoeken · Winkelwagen · Verlanglijst · Afrekenen ·
Account (registreren, inloggen, wachtwoord vergeten/herstellen, adressen, bestellingen) ·
Over ons · Contact · Veelgestelde vragen · Privacybeleid · Algemene voorwaarden · 404

Producten, categorieën en merken komen live uit Square; het aantal pagina's schuift mee
met wat er in de Square-catalogus staat, niet met een vast aantal.

## Mappen

```
app/
  (winkel)/     De webwinkel, met eigen navigatie en voettekst
  api/          Auth-routes, afrekenen, catalog-cache-hooks, Square-webhook
  layout.tsx    Alleen wat overal geldt: lettertypen, providers, meldingen
  sitemap.ts    Sitemap, robots.txt en de gegenereerde deelafbeelding
components/
  account/      Registreren, inloggen, adressen, bestelgeschiedenis
  catalogus/    Productraster, filters en paginakoppen
  contact/      Contactformulier
  home/         Secties van de homepagina
  layout/       Header, megamenu, footer, aankondigingsbalk
  merk/         Logo en merkiconen
  motion/       Herbruikbare onthul-animaties
  product/      Galerij, koopblok, beoordelingen, productkaart
  ui/           shadcn/ui primitieven
  winkel/       Winkelwagen, verlanglijst en afrekenen
data/
  catalogus/    Ruwe invoertabellen uit de prijslijsten — alleen nog gebruikt om de
                Square-sandbox te zaaien, niet meer door de site zelf gelezen
  media.ts, categorieen.ts, merken.ts, veelgestelde-vragen.ts — echt statische inhoud
lib/
  square/       Live catalogus, voorraad en bestellingen via de Square API
  db/           Drizzle-schema en -client (Neon/Postgres)
  winkel/       Winkelwagen- en verlanglijststaat, prijsberekening
  catalogus.ts  Filteren, sorteren en facetten op de Square-respons
  zoeken.ts     Zoeken met Nederlands-Engelse synoniemen
scripts/
  extract-catalog.mjs       Tekst/foto's uit de prijslijst-PDF's
  square-catalog-sync.ts    Zaait de Square-sandbox met dat assortiment
  square-webhook-setup.ts   Registreert het webhook-abonnement bij Square
types/          Domeinmodellen
```

## Catalogus

De winkel draait volledig op de **live Square-catalogus** — geen statische productdata meer.
`scripts/square-catalog-sync.ts` heeft de Square sandbox eenmalig gezaaid met het echte
assortiment uit de twee prijslijsten van april 2026 (tekst en foto's daaruit gehaald met
`scripts/extract-catalog.mjs`, foto's staan in `public/producten/`). Van daaruit is Square de
bron van waarheid: prijzen, voorraad en catalogus-wijzigingen komen live binnen via
`lib/square/*.server.ts`, met een cache die realtime revalideert op Square's webhooks
(`app/api/webhooks/square/route.ts`).

Omdat custom attributes op Square's kant een bevestigde platformbug hebben (zie
`docs/square-support-report.md`, ticket open), lopen de facetten (Techniek/Sterktesoort/
Vorm/Kleurfamilie/Merk/Slug) tijdelijk als voorvoegsel-categorieën (`Techniek: PTC`)
in plaats van als echte custom attributes.

**Wat echt is:** productnamen, prijzen, voorraad, sterktes, lensspecificaties, foto's, adres,
telefoonnummer, openingstijden — allemaal live uit Square. Accounts, wachtwoorden, adressen
en bestellingen zijn echt en staan in een eigen database; afrekenen gaat echt tegen Square's
sandbox (geen echt geld).

**Wat demodata is:** alleen productpopulariteit/"nieuw"-badges, deterministisch uit de
productslug afgeleid zodat server en client dezelfde cijfers tonen. Er zijn bewust geen
productbeoordelingen: verzonnen sterren en recensies op een echte productiesite zijn
misleidend voor klanten en een reëel SEO/juridisch risico via de structured data.

## Designsysteem

De tokens in `app/globals.css` zijn bemonsterd uit het logo en de prijslijsten:

| Token | Waarde | Gebruik |
| --- | --- | --- |
| `--salie-300` | `#a8b8a0` | Merkkleur |
| `--salie-700` | `#4a5844` | Knoppen en links |
| `--creme` | `#faf6f1` | Achtergrond |
| `--inkt` | `#100f0d` | Tekst |
| `--goud` | `#c79a3a` | Waarderingssterren, accenten |

Salie 300 is te licht voor tekst op creme; daarom bestaat er een volledige schaal
en gebruiken interactieve elementen een donkerdere stap.

### Grafiekkleuren

De salietint heeft te weinig chroma om reeksen uit elkaar te houden: in een grafiek
leest hij als grijs. De twee reekskleuren zijn daarom apart gekozen en gecontroleerd
op kleurenblindheid.

| Rol | Waarde | Onderlinge afstand |
| --- | --- | --- |
| Reeks 1 | `#2e7d4f` | CVD 18,3 · normaal zicht 24,8 |
| Reeks 2 | `#7a5cc4` | beide boven 3:1 contrast met wit |

Grafieken met meer dan een reeks hebben altijd een legenda en een tabelweergave,
zodat kleur nooit de enige drager van betekenis is.

## Wat er niet in zit

Geen echt geld: afrekenen gaat tegen Square's **sandbox**, niet tegen een productieaccount.
Er is geen apart beheerpaneel — Square's eigen dashboard is de enige plek om de catalogus te
beheren. De winkelwagen, verlanglijst en recent bekeken artikelen staan in `localStorage`;
alleen na inloggen migreert de verlanglijst naar de database. Het contactformulier verstuurt
een echte e-mail (Resend) naar UKM's eigen adres.
