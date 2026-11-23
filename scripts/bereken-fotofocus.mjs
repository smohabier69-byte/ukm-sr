/**
 * Bepaalt per productfoto het brandpunt (gezicht, montuur, lens) en schrijft
 * dat naar data/catalogus/fotofocus.json als CSS object-position.
 *
 * De foto's uit de prijslijsten zijn meestal staand (3:4 tot 9:16), terwijl
 * kaarten, bogen en banners ze in een ander formaat uitsnijden. Met een vaste
 * `object-top` valt het gezicht dan vaak half buiten beeld. sharp's
 * "attention"-strategie zoekt het deel met de meeste huidtinten, verzadiging
 * en detail; waar die uitsnede op de foto valt, wordt het brandpunt.
 *
 * Alleen foto's waar de code naar verwijst komen in het bestand, zodat het
 * klein blijft.
 *
 *   node scripts/bereken-fotofocus.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

sharp.cache(false);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FOTO_DIR = path.join(ROOT, "public", "producten", "nov26");
const UIT = path.join(ROOT, "data", "catalogus", "fotofocus.json");

/** Alle paden naar nov26-foto's die ergens in de broncode staan. */
function verwezenPaden() {
  const gevonden = new Set();
  const loop = (map) => {
    for (const naam of fs.readdirSync(map, { withFileTypes: true })) {
      const vol = path.join(map, naam.name);
      if (naam.isDirectory()) {
        if (["node_modules", ".next", ".git", ".claude", "public"].includes(naam.name)) continue;
        loop(vol);
      } else if (/\.(ts|tsx)$/.test(naam.name)) {
        const tekst = fs.readFileSync(vol, "utf8");
        // Directe paden en de korte helpers d("p005-1") / l("p003-1") / h(...) / hn(...) in de catalogusbestanden.
        for (const m of tekst.matchAll(/\/producten\/nov26\/[a-z]+\/[a-z]+-(?:p\d{3}-\d+|nv-[a-z]+)\.webp/g)) gevonden.add(m[0]);
        const helper = { d: "dames", h: "heren", hn: "herennov", l: naam.name === "lenzen.ts" ? "lenzen" : "lees" };
        for (const m of tekst.matchAll(/\b(hn|[dhl])\("(p\d{3}-\d+|nv-[a-z]+)"\)/g)) {
          const lijst = helper[m[1]];
          gevonden.add(`/producten/nov26/${lijst}/${lijst}-${m[2]}.webp`);
        }
        for (const m of tekst.matchAll(/foto\("([a-z]+)", "(p\d{3}-\d+)"\)/g)) {
          gevonden.add(`/producten/nov26/${m[1]}/${m[1]}-${m[2]}.webp`);
        }
      }
    }
  };
  loop(ROOT);
  return [...gevonden].sort();
}

const procent = (waarde) => `${Math.round(Math.min(100, Math.max(0, waarde)))}%`;

/**
 * Lensfoto's zijn portretten en close-ups waar het om de ogen gaat. De
 * attention-strategie kiest daar vaak mond, hals of shirt (meer huid), dus
 * lenzen krijgen een vaste ooghoogte in plaats van een berekend punt.
 */
const LENS_STANDAARD = "50% 38%";

/**
 * Handmatig nagekeken: foto's waar de berekening naast zat (borst in plaats
 * van gezicht, een uithangbord in plaats van het montuur). Nagelopen op een
 * contactvel met 4:5-uitsneden; voeg hier een regel toe als een nieuwe foto
 * verkeerd valt.
 */
const handmatig = {
  "/producten/nov26/dames/dames-p009-2.webp": "50% 20%",
  "/producten/nov26/dames/dames-p020-1.webp": "50% 20%",
  "/producten/nov26/dames/dames-p021-1.webp": "50% 30%",
  "/producten/nov26/dames/dames-p025-1.webp": "50% 30%",
  "/producten/nov26/dames/dames-p022-1.webp": "50% 75%",
  "/producten/nov26/dames/dames-p023-2.webp": "50% 80%",
  "/producten/nov26/dames/dames-p024-2.webp": "50% 80%",
  "/producten/nov26/dames/dames-p031-2.webp": "50% 80%",
  "/producten/nov26/dames/dames-p065-1.webp": "50% 25%",
  "/producten/nov26/dames/dames-p066-1.webp": "50% 25%",
  "/producten/nov26/dames/dames-p066-2.webp": "70% 50%",
  // Ook in brede kaders (paginakop, megamenu) moeten ogen en montuur in beeld blijven.
  "/producten/nov26/heren/heren-p002-2.webp": "50% 45%",
  "/producten/nov26/dames/dames-p028-1.webp": "50% 45%",
  // Night Vision: de uitsneden zijn al gecentreerd opgebouwd, de posters lezen van boven naar onder.
  "/producten/nov26/herennov/herennov-nv-goud.webp": "50% 50%",
  "/producten/nov26/herennov/herennov-nv-zwart.webp": "50% 50%",
  "/producten/nov26/herennov/herennov-nv-polarized.webp": "50% 50%",
  "/producten/nov26/herennov/herennov-p015-1.webp": "50% 50%",
  "/producten/nov26/herennov/herennov-p017-1.webp": "50% 50%",
  // Liggende close-ups van een montuur: midden houden, anders valt een glas weg.
  "/producten/nov26/dames/dames-p015-1.webp": "50% 50%",
  "/producten/nov26/dames/dames-p016-1.webp": "50% 50%",
  "/producten/nov26/dames/dames-p017-1.webp": "50% 50%",
  "/producten/nov26/dames/dames-p018-1.webp": "50% 50%",
  "/producten/nov26/dames/dames-p051-2.webp": "50% 50%",
  "/producten/nov26/dames/dames-p053-1.webp": "50% 50%",
  "/producten/nov26/dames/dames-p055-1.webp": "50% 50%",
  "/producten/nov26/dames/dames-p057-1.webp": "50% 50%",
  "/producten/nov26/lees/lees-p005-1.webp": "50% 50%",
  // PTC-blok op de homepagina: breed kader, dus het gezicht moet lager in de foto blijven.
  "/producten/nov26/dames/dames-p070-1.webp": "50% 40%",
  "/producten/nov26/dames/dames-p070-2.webp": "50% 40%",
  "/producten/nov26/lees/lees-p003-1.webp": "50% 62%",
  "/producten/nov26/lees/lees-p004-1.webp": "50% 22%",
  "/producten/nov26/lees/lees-p005-2.webp": "50% 20%",
  "/producten/nov26/lees/lees-p009-3.webp": "50% 35%",
  "/producten/nov26/lees/lees-p010-2.webp": "50% 70%",
  "/producten/nov26/lenzen/lenzen-p008-1.webp": "50% 25%",
  "/producten/nov26/lenzen/lenzen-p010-1.webp": "50% 25%",
  "/producten/nov26/lenzen/lenzen-p011-1.webp": "50% 55%",
  "/producten/nov26/lenzen/lenzen-p036-1.webp": "50% 20%",
  "/producten/nov26/lenzen/lenzen-p054-4.webp": "50% 20%",
  "/producten/nov26/lenzen/lenzen-p075-6.webp": "50% 55%",
};

const focus = {};
let overgeslagen = 0;
for (const src of verwezenPaden()) {
  const bestand = path.join(ROOT, "public", src);
  if (!fs.existsSync(bestand)) {
    console.warn(`Ontbreekt: ${src}`);
    overgeslagen++;
    continue;
  }
  if (handmatig[src]) {
    focus[src] = handmatig[src];
    continue;
  }
  const buffer = fs.readFileSync(bestand);
  const { width: B, height: H, hasAlpha } = await sharp(buffer).metadata();
  // Vrijstaande uitsnedes staan al gecentreerd op een eigen canvas.
  if (hasAlpha) continue;
  if (src.includes("/lenzen/")) {
    focus[src] = B >= H ? "50% 50%" : LENS_STANDAARD;
    continue;
  }

  const zijde = Math.min(B, H);
  const { info } = await sharp(buffer)
    .resize({ width: zijde, height: zijde, fit: "cover", position: sharp.strategy.attention })
    .toBuffer({ resolveWithObject: true });

  // Het midden van de gekozen uitsnede, niet de verschuiving ervan. Als
  // object-position gebruikt valt dat punt in elk kader (staand, vierkant of
  // breed) ongeveer op dezelfde hoogte; een verschuiving van 0% of 100% zou
  // in een breed kader juist kruin of kin tonen.
  const links = Math.abs(info.cropOffsetLeft ?? 0);
  const boven = Math.abs(info.cropOffsetTop ?? 0);
  const x = ((links + zijde / 2) / B) * 100;
  const y = ((boven + zijde / 2) / H) * 100;
  focus[src] = `${procent(x)} ${procent(y)}`;
}

fs.writeFileSync(UIT, `${JSON.stringify(focus, null, 1)}\n`);
console.log(`${Object.keys(focus).length} brandpunten geschreven naar ${path.relative(ROOT, UIT)} (${overgeslagen} ontbrekend).`);
