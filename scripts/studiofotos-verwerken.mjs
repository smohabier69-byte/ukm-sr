/**
 * Zet de vierkante studiofoto's (ukm-website-product-images.zip) om naar de
 * 4:5-versie voor de website: witranden eraf, product gecentreerd op wit met
 * ruimte eromheen, zodat productkaart (4:5) en galerij (3:4) niets afsnijden.
 *
 *   node scripts/studiofotos-verwerken.mjs <uitgepakte-zipmap>
 *
 * Schrijft public/producten/studio/<categorie>/<naam>.webp en voegt de paden
 * met brandpunt "50% 50%" toe aan data/catalogus/fotofocus.json.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const bron = process.argv[2];
if (!bron) {
  console.error("Gebruik: node scripts/studiofotos-verwerken.mjs <uitgepakte-zipmap>");
  process.exit(1);
}
const BREED = 1000;
const HOOG = 1250;
const MAX_B = 840;
const MAX_H = 1000;

const lijst = JSON.parse(fs.readFileSync(path.join(bron, "products.json"), "utf8"));
const focusPad = path.join("data", "catalogus", "fotofocus.json");
const focus = JSON.parse(fs.readFileSync(focusPad, "utf8"));

for (const { image_path } of lijst) {
  const doel = path.join("public", "producten", "studio", image_path);
  fs.mkdirSync(path.dirname(doel), { recursive: true });
  const product = await sharp(path.join(bron, image_path))
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 8 })
    .resize(MAX_B, MAX_H, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });
  await sharp({ create: { width: BREED, height: HOOG, channels: 3, background: "#ffffff" } })
    .composite([
      {
        input: product.data,
        left: Math.round((BREED - product.info.width) / 2),
        top: Math.round((HOOG - product.info.height) / 2),
      },
    ])
    .webp({ quality: 84 })
    .toFile(doel);
  focus[`/producten/studio/${image_path}`] = "50% 50%";
}
fs.writeFileSync(focusPad, `${JSON.stringify(focus, null, 1)}\n`);
console.log(`${lijst.length} studiofoto's verwerkt.`);
