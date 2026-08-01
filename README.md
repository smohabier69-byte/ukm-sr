# UKM.sr — Webshop demo

Een premium e-commerce demonstratie voor **UKM.sr** (Utsukushiku Kenkona Me — *Mooie, gezonde ogen*),
opticien aan de Rembrandtstraat #84 in Paramaribo.

De volledige interface is Nederlandstalig, met Surinaamse conventies: prijzen als `SRD 695,-`,
decimale komma, datums `dd-mm-jjjj` en 10% BTW.

> Deze website is een demonstratie. Er kunnen geen bestellingen worden geplaatst
> en er worden geen betalingen verwerkt.

## Starten

```bash
npm install
npm run dev
```

De site draait daarna op <http://localhost:3000>.

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

**Winkel** — Home · Alle producten · Categorie (7) · Merken en merkdetail · Aanbiedingen ·
Productdetail (105) · Zoeken · Winkelwagen · Verlanglijst · Afrekenen · Mijn account ·
Over ons · Contact · Veelgestelde vragen · Privacybeleid · Algemene voorwaarden · 404

## Mappen

```
app/
  (winkel)/     De webwinkel, met eigen navigatie en voettekst
  layout.tsx    Alleen wat overal geldt: lettertypen, providers, meldingen
  sitemap.ts    Sitemap, robots.txt en de gegenereerde deelafbeelding
components/
  account/      Overzicht van wat lokaal is opgeslagen
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
  catalogus/    Ruwe invoertabellen per prijslijst
  producten.ts  Bouwt de producten op en levert de selecties
lib/
  winkel/       Winkelwagen- en verlanglijststaat, prijsberekening
  catalogus.ts  Filteren, sorteren en facetten
  zoeken.ts     Zoeken met Nederlands-Engelse synoniemen
scripts/        Extractie van de prijslijst-PDF's
types/          Domeinmodellen
```

## Catalogus

Alle producten, prijzen en foto's komen uit de twee officiele prijslijsten van april 2026.
`scripts/extract-catalog.mjs` haalt tekst en productfoto's uit de PDF's en schrijft de foto's
naar `public/producten/`. Opnieuw uitvoeren bij een nieuwe prijslijst:

```bash
node scripts/extract-catalog.mjs "<pad>/UKM.sr Brillen Prijslijst.pdf" "<pad>/UKM.sr Lenzen Prijslijst.pdf"
```

De tabellen in `data/catalogus/` verwijzen per artikel naar het paginanummer in de PDF,
zodat prijzen bij een nieuwe uitgave eenvoudig na te lopen zijn.

**Wat echt is:** productnamen, prijzen, sterktes, lensspecificaties, foto's, adres,
telefoonnummer en openingstijden.

**Wat demodata is:** voorraadaantallen en populariteit. Die worden deterministisch uit de
productslug afgeleid, zodat server en client dezelfde cijfers tonen en er geen
hydratieverschil ontstaat. Er zijn bewust geen productbeoordelingen: verzonnen sterren en
recensies op een echte productiesite zijn misleidend voor klanten en een reëel SEO/juridisch
risico via de structured data.

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

Er is geen achterkant. Bestellingen, betalingen, aanmelden en formulieren doen niets;
elke plek waar dat opvalt zegt dat er ook bij. De winkelwagen, verlanglijst en
recent bekeken artikelen staan in `localStorage`, niet op een server.
