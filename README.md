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

## Mappen

```
app/            Routes, layout, globale stijlen
components/
  home/         Secties van de homepagina
  layout/       Header, megamenu, footer, aankondigingsbalk
  merk/         Logo en merkiconen
  motion/       Herbruikbare onthul-animaties
  product/      Productkaart en waarderingssterren
  ui/           shadcn/ui primitieven
data/
  catalogus/    Ruwe invoertabellen per prijslijst
  producten.ts  Bouwt de producten op en levert de selecties
lib/            Bedrijfsgegevens, opmaakhulpjes
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

**Wat demodata is:** voorraadaantallen, waarderingen, aantal beoordelingen en populariteit.
Die worden deterministisch uit de productslug afgeleid, zodat server en client dezelfde
cijfers tonen en er geen hydratieverschil ontstaat.

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
