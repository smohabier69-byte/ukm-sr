/**
 * Het adres waarop de site draait. Zet NEXT_PUBLIC_SITE_URL na de eerste
 * deploy op het echte domein, zodat canonieke links, de sitemap en de
 * deelafbeeldingen naar de juiste plek wijzen.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ukm-sr.vercel.app").replace(/\/$/, "");

/**
 * Centrale bedrijfsgegevens. Alles hier komt uit de officiele prijslijsten
 * (april 2026) en de Facebookpagina van UKM.sr.
 */
export const bedrijf = {
  naam: "UKM.sr",
  /** Zoals in de prijslijst en op het logo gespeld, met macron op de o. */
  tagline: "Utsukushiku Kenkōna Me",
  taglineVertaling: "Mooie, gezonde ogen",
  beschrijving:
    "Anti-blauwlicht brillen, photochrome PTC-brillen en kleurlenzen. Persoonlijk advies aan de Rembrandtstraat, bezorging door heel Paramaribo.",
  adres: {
    straat: "Rembrandtstraat #84",
    stad: "Paramaribo",
    land: "Suriname",
  },
  telefoon: "+597 841-1203",
  telefoonPlat: "5978411203",
  whatsapp: "5978411203",
  instagram: "ukm.sr",
  instagramUrl: "https://www.instagram.com/ukm.sr",
  facebookUrl: "https://www.facebook.com/61574652149399",
  email: "info@ukm.sr",
  openingstijden: [
    { dagen: "Maandag t/m vrijdag", tijden: "10:00 - 18:00" },
    { dagen: "Zaterdag", tijden: "09:00 - 15:00" },
    { dagen: "Zondag", tijden: "Gesloten" },
  ],
  bezorgingVanaf: 100,
  gratisBezorgingVanaf: 1500,
  btwTarief: 0.1,
} as const;

export const hoofdnavigatie = [
  { label: "Brillen", href: "/categorie/brillen" },
  { label: "Lenzen", href: "/categorie/lenzen" },
  { label: "Merken", href: "/merken" },
  { label: "Aanbiedingen", href: "/aanbiedingen" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Contact", href: "/contact" },
] as const;

export const footernavigatie = {
  winkelen: [
    { label: "Alle producten", href: "/producten" },
    { label: "Anti-blauwlicht brillen", href: "/categorie/anti-blauwlicht" },
    { label: "PTC photochrome brillen", href: "/categorie/ptc" },
    { label: "Kleurlenzen met sterkte", href: "/categorie/lenzen-met-sterkte" },
    { label: "Kleurlenzen zonder sterkte", href: "/categorie/lenzen-zonder-sterkte" },
    { label: "Kinderbrillen", href: "/categorie/kinderbrillen" },
  ],
  klantenservice: [
    { label: "Contact", href: "/contact" },
    { label: "Veelgestelde vragen", href: "/veelgestelde-vragen" },
    { label: "Bezorging en afhalen", href: "/veelgestelde-vragen#bezorging" },
    { label: "Lenzen hygiene", href: "/veelgestelde-vragen#hygiene" },
    { label: "Mijn account", href: "/account" },
    { label: "Verlanglijst", href: "/verlanglijst" },
  ],
  bedrijf: [
    { label: "Over ons", href: "/over-ons" },
    { label: "Onze winkel", href: "/contact#winkel" },
    { label: "Privacybeleid", href: "/privacybeleid" },
    { label: "Algemene voorwaarden", href: "/algemene-voorwaarden" },
  ],
} as const;

export const voordelen = [
  {
    icoon: "Truck",
    titel: "Bezorging door heel Paramaribo",
    tekst: `Al vanaf ${bedrijf.bezorgingVanaf === 100 ? "SRD 100,-" : ""} bezorgkosten. Gratis vanaf SRD 1.500,-.`,
  },
  {
    icoon: "Store",
    titel: "Persoonlijk passen in de winkel",
    tekst: "Kom langs aan de Rembrandtstraat #84 en probeer elk montuur rustig uit.",
  },
  {
    icoon: "ShieldCheck",
    titel: "Gecertificeerde kwaliteit",
    tekst: "Onze lenzen zijn FDA, GMP, ISO en CE goedgekeurd.",
  },
  {
    icoon: "MessageCircle",
    titel: "Advies via WhatsApp",
    tekst: "Stuur ons een bericht en we denken met je mee over sterkte, vorm en kleur.",
  },
] as const;

export function whatsappLink(bericht: string): string {
  return `https://wa.me/${bedrijf.whatsapp}?text=${encodeURIComponent(bericht)}`;
}
