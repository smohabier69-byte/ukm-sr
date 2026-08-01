/**
 * Navigatiestructuur van de winkel.
 *
 * De catalogus (categorieen en huislijnen) komt rechtstreeks uit
 * data/categorieen.ts en data/merken.ts voor het megamenu en de mobiele
 * navigatie in site-header.tsx. Hier staat alleen wat geen productoverzicht
 * is.
 */
export const hoofdnavigatie = [
  { label: "Media", href: "/media" },
  { label: "Aanbiedingen", href: "/aanbiedingen" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Contact", href: "/contact" },
] as const;
