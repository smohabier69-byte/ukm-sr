/**
 * Studiofoto's (wit, vrijstaand) per product, uit ukm-website-product-images.zip
 * (november 2026). Die zijn met beeld-AI gereconstrueerd uit de catalogusfoto's;
 * kleine details kunnen afwijken van de echte montuur of lens.
 *
 * - `fotos[0]` wordt de hoofdfoto van het product (kaart, galerij, Square).
 * - `varianten` koppelt een kleurvariant aan haar studiofoto.
 * - `hover` is de index in de bestaande catalogusfoto's van de foto die op de
 *   productkaart verschijnt bij hover: bij voorkeur iemand die het product draagt.
 *
 * Bestanden staan als 4:5-versie in public/producten/studio/ (scripts/studiofotos-verwerken.mjs).
 */
export interface Studiofotos {
  fotos: string[];
  varianten?: Record<string, string>;
  hover?: number;
}

const s = (pad: string) => `/producten/studio/${pad.replace(/\.webp$/, "")}.webp`;

export const studiofotos: Record<string, Studiofotos> = {
  // Dames PTC / anti-blauwlicht
  "frameless-rectangle-ptc": { fotos: [s("collection/frameless-rectangle-anti-bluelight-ptc-glasses")] },
  "big-cat-eye-ptc": {
    fotos: [
      s("collection/black-big-cat-eye-ptc-anti-bluelight-glasses-black"),
      s("collection/black-big-cat-eye-ptc-anti-bluelight-glasses-translucent"),
      s("collection/olive-green-brown-big-cat-eye-ptc-anti-bluelight-glasses"),
      s("collection/leopard-big-cat-eye-ptc-anti-bluelight-glasses"),
    ],
    varianten: {
      zwart: s("collection/black-big-cat-eye-ptc-anti-bluelight-glasses-black"),
      nude: s("collection/black-big-cat-eye-ptc-anti-bluelight-glasses-translucent"),
      olijfbruin: s("collection/olive-green-brown-big-cat-eye-ptc-anti-bluelight-glasses"),
      leopard: s("collection/leopard-big-cat-eye-ptc-anti-bluelight-glasses"),
    },
    hover: 1,
  },
  "cat-eye-ptc": {
    fotos: [
      s("collection/red-cat-eye-ptc-anti-bluelight-glasses"),
      s("collection/tiger-print-cat-eye-ptc-anti-bluelight-glasses"),
      s("collection/nude-cat-eye-ptc-anti-bluelight-glasses"),
      s("collection/black-cat-eye-ptc-anti-bluelight-glasses"),
    ],
    varianten: {
      rood: s("collection/red-cat-eye-ptc-anti-bluelight-glasses"),
      "tiger-print": s("collection/tiger-print-cat-eye-ptc-anti-bluelight-glasses"),
      nude: s("collection/nude-cat-eye-ptc-anti-bluelight-glasses"),
      zwart: s("collection/black-cat-eye-ptc-anti-bluelight-glasses"),
    },
    hover: 1,
  },
  "red-diamond-cut-ptc": { fotos: [s("collection/red-diamond-cut-ptc-anti-bluelight-glasses")], hover: 1 },
  "thin-frame-cat-eye-glitter-ptc": {
    fotos: [
      s("collection/thin-frame-cat-eye-glitter-white-gold-ptc-glasses"),
      s("collection/thin-frame-cat-eye-glitter-white-black-ptc-glasses"),
      s("collection/thin-frame-cat-eye-glitter-pink-gold-ptc-glasses"),
      s("collection/thin-frame-cat-eye-glitter-black-gold-ptc-glasses"),
    ],
    varianten: {
      "wit-goud": s("collection/thin-frame-cat-eye-glitter-white-gold-ptc-glasses"),
      "wit-zwart": s("collection/thin-frame-cat-eye-glitter-white-black-ptc-glasses"),
      "roze-goud": s("collection/thin-frame-cat-eye-glitter-pink-gold-ptc-glasses"),
      "zwart-goud": s("collection/thin-frame-cat-eye-glitter-black-gold-ptc-glasses"),
    },
  },
  "gold-cat-eye-ptc": {
    fotos: [s("collection/baby-pink-gold-cat-eye-ptc-glasses"), s("collection/white-gold-cat-eye-ptc-glasses")],
    varianten: {
      "babyroze-goud": s("collection/baby-pink-gold-cat-eye-ptc-glasses"),
      "wit-goud": s("collection/white-gold-cat-eye-ptc-glasses"),
    },
    hover: 1,
  },
  "xl-white-gold-cat-eye-ptc": { fotos: [s("collection/xl-white-gold-cat-eye-ptc-glasses")], hover: 1 },
  "frameless-glitter-gold-ptc": {
    fotos: [
      s("collection/frameless-glitter-gold-pink-ptc-glasses"),
      s("collection/frameless-glitter-gold-brown-tint-ptc-glasses"),
      s("collection/frameless-glitter-gold-grey-tint-ptc-glasses"),
    ],
    varianten: {
      roze: s("collection/frameless-glitter-gold-pink-ptc-glasses"),
      bruin: s("collection/frameless-glitter-gold-brown-tint-ptc-glasses"),
      grijs: s("collection/frameless-glitter-gold-grey-tint-ptc-glasses"),
    },
  },
  "glitter-round-ptc": {
    fotos: [
      s("collection/rose-gold-ptc-glitter-round-glasses"),
      s("collection/zilver-blue-glitter-round-ptc-glasses"),
      s("collection/purple-rose-gold-glitter-round-ptc-glasses"),
      s("collection/zilver-black-glitter-round-ptc-glasses"),
    ],
    varianten: {
      "rose-goud": s("collection/rose-gold-ptc-glitter-round-glasses"),
      "zilver-blauw": s("collection/zilver-blue-glitter-round-ptc-glasses"),
      "paars-rose-goud": s("collection/purple-rose-gold-glitter-round-ptc-glasses"),
      "zilver-zwart": s("collection/zilver-black-glitter-round-ptc-glasses"),
    },
    hover: 1,
  },
  "brown-rose-gold-round-cat-eye-ptc": { fotos: [s("collection/brown-rose-gold-round-cat-eye-ptc-glasses")], hover: 1 },
  "duo-tone-cat-eye-ptc": {
    fotos: [
      s("collection/pink-dusty-blue-cat-eye-ptc-glasses"),
      s("collection/laveder-mint-cat-eye-ptc-glasses"),
      s("collection/black-grey-cat-eye-ptc-glasses"),
    ],
    varianten: {
      "roze-blauw": s("collection/pink-dusty-blue-cat-eye-ptc-glasses"),
      "lavendel-mint": s("collection/laveder-mint-cat-eye-ptc-glasses"),
      "zwart-grijs": s("collection/black-grey-cat-eye-ptc-glasses"),
    },
    hover: 1,
  },
  "high-edge-cat-eye-ptc": {
    fotos: [
      s("collection/high-edge-cat-eye-red-ptc-glasses"),
      s("collection/high-edge-cat-eye-green-ptc-glasses"),
      s("collection/high-edge-cat-eye-white-ptc-glasses"),
      s("collection/high-edge-cat-eye-black-ptc-glasses"),
    ],
    varianten: {
      rood: s("collection/high-edge-cat-eye-red-ptc-glasses"),
      groen: s("collection/high-edge-cat-eye-green-ptc-glasses"),
      wit: s("collection/high-edge-cat-eye-white-ptc-glasses"),
      zwart: s("collection/high-edge-cat-eye-black-ptc-glasses"),
    },
    hover: 1,
  },
  "soft-geometric-cat-eye-black-gold-ptc": { fotos: [s("collection/soft-geometric-cat-eye-black-gold-ptc-glasses")] },
  "oval-gold-pearl-ptc": { fotos: [s("collection/oval-gold-pearl-ptc-glasses")] },
  "pink-sharp-edge-thick-frame-ptc": {
    fotos: [s("collection/pink-sharp-edge-thick-frame-ptc"), s("collection/pink-cat-eye-glitter-thin-frame-ptc")],
  },
  "ptc-glossy-cat-eye": {
    fotos: [s("collection/ptc-glossy-cat-eye-pink"), s("collection/ptc-glossy-cat-eye-black")],
    varianten: { nude: s("collection/ptc-glossy-cat-eye-pink"), tortoise: s("collection/ptc-glossy-cat-eye-black") },
    hover: 1,
  },
  "lv-clover-light-brown-cat-eye-ptc": { fotos: [s("collection/lv-clover-light-brown-cat-eye-ptc-glasses")] },
  "square-cat-eye": {
    fotos: [
      s("collection/square-leopard-cat-eye-non-ptc-black-leopard"),
      s("collection/square-leopard-cat-eye-non-ptc-brown-leopard"),
      s("collection/square-cat-eye-pink-snow-leopard-non-ptc"),
      s("collection/turquoise-purple-cat-eye-non-ptc"),
    ],
    varianten: {
      leopard: s("collection/square-leopard-cat-eye-non-ptc-black-leopard"),
      tortoise: s("collection/square-leopard-cat-eye-non-ptc-brown-leopard"),
      "pink-snow-leopard": s("collection/square-cat-eye-pink-snow-leopard-non-ptc"),
      "turquoise-paars": s("collection/turquoise-purple-cat-eye-non-ptc"),
    },
    hover: 1,
  },
  "square-pastel": {
    fotos: [
      s("collection/non-ptc-square-pastel-blue-glasses-pink"),
      s("collection/non-ptc-square-pastel-blue-glasses-blue"),
      s("collection/non-ptc-square-pastel-creme-glasses"),
    ],
    varianten: {
      pastelroze: s("collection/non-ptc-square-pastel-blue-glasses-pink"),
      pastelblauw: s("collection/non-ptc-square-pastel-blue-glasses-blue"),
      creme: s("collection/non-ptc-square-pastel-creme-glasses"),
    },
    hover: 1,
  },
  "cat-eye-anti-blauwlicht": {
    fotos: [s("collection/non-ptc-cat-eye-black-glasses"), s("collection/non-ptc-cat-eye-leopard-mauve-glasses")],
    varianten: {
      zwart: s("collection/non-ptc-cat-eye-black-glasses"),
      "leopard-mauve": s("collection/non-ptc-cat-eye-leopard-mauve-glasses"),
    },
    hover: 1,
  },
  "zilver-round-frameless": { fotos: [s("collection/zilver-round-frameless-non-ptc-glasses")] },
  "black-cat-ear": { fotos: [s("collection/black-cat-ear-non-ptc-anti-bluelight-glasses")], hover: 1 },

  // Heren & unisex
  "frameless-hexagon-ptc": {
    fotos: [s("men/frameless-hexagon-rose-gold-ptc-glasses"), s("men/frameless-hexagon-ptc-zilver-glasses")],
    varianten: {
      "rose-goud": s("men/frameless-hexagon-rose-gold-ptc-glasses"),
      zilver: s("men/frameless-hexagon-ptc-zilver-glasses"),
    },
    hover: 1,
  },
  "sport-ptc": {
    fotos: [s("men/sport-anti-uv-anti-bluelight-black-ptc-glasses"), s("men/sport-anti-uv-anti-bluelight-grey-ptc-glasses")],
    varianten: {
      zwart: s("men/sport-anti-uv-anti-bluelight-black-ptc-glasses"),
      grijs: s("men/sport-anti-uv-anti-bluelight-grey-ptc-glasses"),
    },
    hover: 1,
  },
  "matt-chrome-square-ptc": {
    fotos: [s("men/matt-black-chrome-square-ptc-glasses"), s("men/matt-translucent-chrome-square-ptc-glasses")],
    varianten: {
      zwart: s("men/matt-black-chrome-square-ptc-glasses"),
      transparant: s("men/matt-translucent-chrome-square-ptc-glasses"),
    },
  },
  "matt-grey-chrome-square-ptc": { fotos: [s("men/matt-grey-chrome-square-ptc-glasses")] },
  "gold-frameless-hexagon-ptc": { fotos: [s("men/gold-frameless-hexagon-ptc-glasses")] },
  "zilver-hexagon-thin-frame-ptc": { fotos: [s("men/zilver-hexagon-thin-frame-ptc-glasses")] },
  "night-vision-driving-glasses": {
    fotos: [s("men/night-vision-driving-glasses-gold"), s("men/night-vision-driving-glasses-black")],
    varianten: { goud: s("men/night-vision-driving-glasses-gold"), zwart: s("men/night-vision-driving-glasses-black") },
  },

  // Leesbrillen
  "leesbril-ptc-gold-frameless": { fotos: [s("reading/ptc-gold-frameless")], hover: 1 },
  "leesbril-ptc-geometric-frameless-black-gold": { fotos: [s("reading/ptc-geometric-frameless-black-gold")] },
  "leesbril-wood-frameless": { fotos: [s("reading/wood-frameless")] },
  "leesbril-silver-frameless": { fotos: [s("reading/silver-frameless")] },
  "leesbril-glitter-pink-frameless": { fotos: [s("reading/glitter-pink-frameless")] },
  "leesbril-small-leopard-cat-eye": {
    fotos: [s("reading/small-leopard-cat-eye-blue-light"), s("reading/small-cat-eye")],
    hover: 1,
  },
  "leesbril-small-brown-cat-eye": {
    fotos: [s("reading/small-brown-silver-blue-light"), s("reading/small-brown-gold-blue-light")],
    varianten: { zilver: s("reading/small-brown-silver-blue-light"), goud: s("reading/small-brown-gold-blue-light") },
  },
  "leesbril-cat-eye-green": { fotos: [s("reading/cat-eye-green")] },
  "leesbril-thin-brow": { fotos: [s("reading/thin-brow-glasses")] },
  "leesbril-black-gold-square": { fotos: [s("reading/black-gold-square")] },
  "leesbril-oval": {
    fotos: [s("reading/oval-dark-brown-blue-light"), s("reading/oval-light-brown-blue-light")],
    varianten: { donkerbruin: s("reading/oval-dark-brown-blue-light"), lichtbruin: s("reading/oval-light-brown-blue-light") },
  },
  "leesbril-small-thin": {
    fotos: [s("reading/small-silver-thin-glasses"), s("reading/small-black-thin-glasses")],
    varianten: { zilver: s("reading/small-silver-thin-glasses"), zwart: s("reading/small-black-thin-glasses") },
  },
  "leesbril-purple-frameless": { fotos: [s("reading/purple-frameless")] },

  // Lenzen zonder sterkte (catalogusfoto's tonen allemaal iemand die de lens draagt)
  "ash-grey": { fotos: [s("lenses/ash-grey")] },
  "earthy-brown": { fotos: [s("lenses/earthy-brown")] },
  "honey-glow": { fotos: [s("lenses/honey-glow")] },
  "cat-eye-brown": { fotos: [s("lenses/cat-eye-brown")] },
  bambie: { fotos: [s("lenses/bambie")] },
  "galaxy-purple": { fotos: [s("lenses/galaxy-purple")] },
  "camouflage-green": { fotos: [s("lenses/camouflage-green-l-018")] },
  "light-grey-brown": { fotos: [s("lenses/light-grey-brown-l-005")] },
  "aqua-blue": { fotos: [s("lenses/aqua-blue-l-044")] },
  "cloudy-blue": { fotos: [s("lenses/cloudy-blue")] },
  "harry-blue": { fotos: [s("lenses/harry-blue")] },
  "harry-blue-new": { fotos: [s("lenses/harry-blue-new-l-010")] },
  "bright-blue": { fotos: [s("lenses/bright-blue-l-001")] },
  "jeans-blue": { fotos: [s("lenses/jeans-blue-l-019")] },
  "ice-blue": { fotos: [s("lenses/ice-blue-l-002")] },
  "forest-green": { fotos: [s("lenses/forest-green")] },
  "mint-green": { fotos: [s("lenses/mint-green")] },
  "violet-pink": { fotos: [s("lenses/violet-pink-l-020")] },
  purple: { fotos: [s("lenses/purple")] },
  "alexa-grey": { fotos: [s("lenses/alexa-grey-l-014"), s("lenses/alexa-grey")] },
  "natural-grey": { fotos: [s("lenses/natural-grey")] },
  "coffee-creme": { fotos: [s("lenses/coffee-creme")] },
  "caramel-coffee": { fotos: [s("lenses/caramel-coffee")] },
  "starry-black": { fotos: [s("lenses/starry-black")] },
  "doll-black": { fotos: [s("lenses/doll-black")] },
  "misty-grey": { fotos: [s("lenses/misty-grey")] },
  "smokey-blue": { fotos: [s("lenses/smokey-blue-l-039")] },
  "galaxy-pink": { fotos: [s("lenses/galaxy-pink-l-036")] },
  "tasha-grey": { fotos: [s("lenses/tasha-grey-l-022")] },
  "natural-blue": { fotos: [s("lenses/natural-blue")] },

  // Lenzen met sterkte
  "ash-grey-met-sterkte": { fotos: [s("lenses/ash-grey-met-sterkte")] },
  "honey-glow-met-sterkte": { fotos: [s("lenses/honey-glow-met-sterkte")] },
  "transparent-brown-met-sterkte": { fotos: [s("lenses/transparent-brown-met-sterkte")] },
  "hazel-brown-met-sterkte": { fotos: [s("lenses/hazel-brown-l-038-met-sterkte")] },
  "bambie-met-sterkte": { fotos: [s("lenses/bambie-l-013-met-sterkte")], hover: 1 },
  "tigri-ai-met-sterkte": { fotos: [s("lenses/tigri-ai-met-sterkte")] },
  "glitter-brown-met-sterkte": { fotos: [s("lenses/glitter-brown-met-sterkte"), s("lenses/glitter-brown")] },
  "caramel-coffee-met-sterkte": { fotos: [s("lenses/caramel-coffee-met-sterkte")] },
  "kathrina-met-sterkte": { fotos: [s("lenses/kathrina-l-017-met-sterkte")] },
  "roseyyy-met-sterkte": { fotos: [s("lenses/roseyyy-l-012-met-sterkte")] },
  "aqua-green-met-sterkte": { fotos: [s("lenses/aqua-green-l-011-met-sterkte")] },
};

/**
 * Fotovolgorde met studiofoto's: studio-hoofdfoto, dan de hoverfoto (iemand
 * die het product draagt), dan de overige studiofoto's en catalogusfoto's.
 */
export function metStudiofotos(slug: string, catalogus: string[]): string[] {
  const studio = studiofotos[slug];
  if (!studio) return catalogus;
  const hoverIndex = Math.min(studio.hover ?? 0, catalogus.length - 1);
  const hover = catalogus[hoverIndex];
  const rest = catalogus.filter((_, i) => i !== hoverIndex);
  return [studio.fotos[0], ...(hover ? [hover] : []), ...studio.fotos.slice(1), ...rest];
}

export function studiofotoVariant(slug: string, variantId: string): string | undefined {
  return studiofotos[slug]?.varianten?.[variantId];
}
