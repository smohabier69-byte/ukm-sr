/**
 * Het adres waarop de site draait. Zet NEXT_PUBLIC_SITE_URL na de eerste
 * deploy op het echte domein, zodat canonieke links, de sitemap en de
 * deelafbeeldingen naar de juiste plek wijzen.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ukm-sr.com").replace(/\/$/, "");

/**
 * Centrale bedrijfsgegevens. Alles hier komt uit de officiele prijslijsten
 * (november 2026) en de Facebookpagina van UKM.sr.
 */
export const bedrijf = {
  naam: "UKM.sr",
  /** Zoals in de prijslijst en op het logo gespeld, met macron op de o. */
  tagline: "Utsukushiku Kenkōna Me",
  taglineVertaling: "Mooie, gezonde ogen",
  beschrijving:
    "Photochrome PTC-brillen, anti-blauwlicht brillen, leesbrillen en kleurlenzen. Persoonlijk advies aan de Rembrandtstraat, bezorging tot aan huis in Paramaribo.",
  adres: {
    straat: "Rembrandtstraat #84",
    stad: "Paramaribo",
    land: "Suriname",
    /** Google Maps-geocode van het adres, voor het Optician-schema (lokale kaartresultaten). */
    lat: 5.8510337,
    lng: -55.1422288,
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
  /**
   * Bezorgkosten in SRD: minimaal bezorgingVanaf, plus bezorgingPerKm voor
   * elke extra kilometer. De site kent de afstand niet; het exacte bedrag
   * bevestigt UKM via WhatsApp.
   */
  bezorgingVanaf: 120,
  bezorgingPerKm: 30,
  btwTarief: 0.1,
} as const;

export const footernavigatie = {
  winkelen: [
    { label: "Alle producten", href: "/producten" },
    { label: "PTC photochrome brillen", href: "/categorie/ptc" },
    { label: "Anti-blauwlicht brillen", href: "/categorie/anti-blauwlicht" },
    { label: "Leesbrillen", href: "/categorie/leesbrillen" },
    { label: "Heren en unisex", href: "/categorie/heren-unisex" },
    { label: "Kleurlenzen zonder sterkte", href: "/categorie/lenzen-zonder-sterkte" },
    { label: "Kleurlenzen met sterkte", href: "/categorie/lenzen-met-sterkte" },
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
    { label: "Media", href: "/media" },
    { label: "Onze winkel", href: "/contact#winkel" },
    { label: "Privacybeleid", href: "/privacybeleid" },
    { label: "Algemene voorwaarden", href: "/algemene-voorwaarden" },
  ],
} as const;


export function whatsappLink(bericht: string): string {
  return `https://wa.me/${bedrijf.whatsapp}?text=${encodeURIComponent(bericht)}`;
}
