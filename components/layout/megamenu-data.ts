export interface MegamenuKolom {
  titel: string;
  items: { label: string; href: string }[];
}

export interface Megamenu {
  label: string;
  href: string;
  kolommen: MegamenuKolom[];
  uitgelicht: {
    label: string;
    titel: string;
    tekst: string;
    href: string;
    afbeelding: string;
  };
}

export const megamenus: Megamenu[] = [
  {
    label: "Brillen",
    href: "/categorie/brillen",
    kolommen: [
      {
        titel: "Collecties",
        items: [
          { label: "PTC photochroom", href: "/categorie/ptc" },
          { label: "Anti-blauwlicht", href: "/categorie/anti-blauwlicht" },
          { label: "Kinderbrillen", href: "/categorie/kinderbrillen" },
          { label: "Alle brillen", href: "/categorie/brillen" },
        ],
      },
      {
        titel: "Montuurvorm",
        items: [
          { label: "Cat eye", href: "/categorie/brillen?vorm=cat-eye" },
          { label: "Browline", href: "/categorie/brillen?vorm=browline" },
          { label: "Frameless", href: "/categorie/brillen?vorm=frameless" },
          { label: "Square", href: "/categorie/brillen?vorm=square" },
          { label: "Aviator", href: "/categorie/brillen?vorm=aviator" },
          { label: "Round", href: "/categorie/brillen?vorm=round" },
        ],
      },
      {
        titel: "Huislijnen",
        items: [
          { label: "UKM Signature", href: "/merken/ukm-signature" },
          { label: "UKM PTC", href: "/merken/ukm-ptc" },
          { label: "UKM Clear", href: "/merken/ukm-clear" },
          { label: "UKM Kids", href: "/merken/ukm-kids" },
        ],
      },
    ],
    uitgelicht: {
      label: "Uitgelicht",
      titel: "PTC Signature",
      tekst: "Diamantgeslepen monturen die binnen helder blijven en buiten donker kleuren.",
      href: "/categorie/ptc",
      afbeelding: "/producten/brillen/brillen-p036-1.jpg",
    },
  },
  {
    label: "Lenzen",
    href: "/categorie/lenzen",
    kolommen: [
      {
        titel: "Collecties",
        items: [
          { label: "Met sterkte", href: "/categorie/lenzen-met-sterkte" },
          { label: "Zonder sterkte", href: "/categorie/lenzen-zonder-sterkte" },
          { label: "Alle lenzen", href: "/categorie/lenzen" },
        ],
      },
      {
        titel: "Kleur",
        items: [
          { label: "Bruin", href: "/categorie/lenzen?kleur=bruin" },
          { label: "Grijs", href: "/categorie/lenzen?kleur=grijs" },
          { label: "Blauw", href: "/categorie/lenzen?kleur=blauw" },
          { label: "Groen", href: "/categorie/lenzen?kleur=groen" },
          { label: "Roze", href: "/categorie/lenzen?kleur=roze" },
          { label: "Zwart", href: "/categorie/lenzen?kleur=zwart" },
        ],
      },
      {
        titel: "Goed om te weten",
        items: [
          { label: "Hygieneregels", href: "/veelgestelde-vragen#hygiene" },
          { label: "Sterkte bepalen", href: "/veelgestelde-vragen#sterkte" },
          { label: "Houdbaarheid", href: "/veelgestelde-vragen#houdbaarheid" },
        ],
      },
    ],
    uitgelicht: {
      label: "Uitgelicht",
      titel: "Soft Lenses",
      tekst: "Ruim dertig tinten, van nauwelijks zichtbaar bruin tot uitgesproken blauw.",
      href: "/categorie/lenzen-zonder-sterkte",
      afbeelding: "/producten/lenzen/lenzen-p047-1.jpg",
    },
  },
];
