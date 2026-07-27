/**
 * Navigatiestructuur van de winkel.
 *
 * Bewust smal gehouden: een dropdown voor de catalogus en daarnaast alleen
 * bestemmingen die geen productoverzicht zijn. Nieuwe categorieen horen hier
 * thuis, niet als extra item naast de dropdown.
 */
export const categorieenDropdown = [
  { label: "Brillen", href: "/categorie/brillen" },
  { label: "Lenzen", href: "/categorie/lenzen" },
  { label: "Alle producten", href: "/producten" },
  { label: "Merken", href: "/merken" },
] as const;

export const hoofdnavigatie = [
  { label: "Media", href: "/media" },
  { label: "Aanbiedingen", href: "/aanbiedingen" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Contact", href: "/contact" },
] as const;
