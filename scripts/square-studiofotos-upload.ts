/**
 * Zet de studiofoto's (data/catalogus/studiofotos.ts) in Square bij de UKM-artikelen:
 * de hoofdfoto op het artikel, en per kleurvariant haar eigen foto op de variatie,
 * zodat de kassa en het dashboard per kleur de juiste foto tonen. Artikelen zonder
 * kleurvarianten krijgen hun extra studiofoto's ook op het artikel.
 *
 * Geupload wordt het vierkante origineel uit de zip (Square toont vierkant); het
 * bijschrift is het pad van de 4:5-versie op de website, zodat de site haar eigen
 * bestand en fotovolgorde blijft gebruiken (zie lib/square/catalog.server.ts).
 *
 * Herhaalbaar: een foto met hetzelfde bijschrift op hetzelfde object wordt overgeslagen.
 * Pink by Moon-artikelen worden niet aangeraakt (alleen items met een "Slug: ..."-facet).
 *
 *   npx tsx scripts/square-studiofotos-upload.ts <uitgepakte-zipmap>          (droog)
 *   npx tsx scripts/square-studiofotos-upload.ts <uitgepakte-zipmap> --echt
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { SquareClient, SquareEnvironment } from "square";
import { studiofotos } from "../data/catalogus/studiofotos";

process.loadEnvFile(".env.local");
const zipMap = process.argv[2];
const ECHT = process.argv.includes("--echt");
if (!zipMap || !fs.existsSync(path.join(zipMap, "products.json"))) {
  console.error("Gebruik: npx tsx scripts/square-studiofotos-upload.ts <uitgepakte-zipmap> [--echt]");
  process.exit(1);
}

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

type Obj = {
  id: string;
  type: string;
  categoryData?: { name?: string };
  imageData?: { caption?: string };
  itemData?: {
    name?: string;
    categories?: { id?: string }[];
    imageIds?: string[];
    variations?: { id: string; itemVariationData?: { sku?: string; imageIds?: string[] } }[];
  };
};

const origineel = (webPad: string) => path.join(zipMap, webPad.replace("/producten/studio/", ""));

async function main() {
  const alle: Obj[] = [];
  for await (const o of await client.catalog.list({ types: "CATEGORY,ITEM,IMAGE" })) alle.push(o as Obj);
  const categorieNaam = new Map(alle.filter((o) => o.type === "CATEGORY").map((o) => [o.id, o.categoryData?.name ?? ""]));
  const bijschrift = new Map(alle.filter((o) => o.type === "IMAGE").map((o) => [o.id, o.imageData?.caption ?? ""]));

  const taken: { objectId: string; foto: string; primair: boolean; label: string }[] = [];
  for (const item of alle.filter((o) => o.type === "ITEM")) {
    const slug = (item.itemData?.categories ?? [])
      .map((c) => categorieNaam.get(c.id ?? "") ?? "")
      .find((n) => n.startsWith("Slug: "))
      ?.slice(6);
    const studio = slug ? studiofotos[slug] : undefined;
    if (!slug || !studio) continue;

    const opItem = new Set((item.itemData?.imageIds ?? []).map((id) => bijschrift.get(id)));
    const voorItem = studio.varianten ? [studio.fotos[0]] : studio.fotos;
    voorItem.forEach((foto, i) => {
      if (!opItem.has(foto)) taken.push({ objectId: item.id, foto, primair: i === 0, label: slug });
    });

    for (const [variantId, foto] of Object.entries(studio.varianten ?? {})) {
      const variatie = (item.itemData?.variations ?? []).find((v) => v.itemVariationData?.sku === `${slug}-${variantId}`);
      if (!variatie) {
        console.warn(`Geen variatie ${slug}-${variantId} in Square.`);
        continue;
      }
      const opVariatie = new Set((variatie.itemVariationData?.imageIds ?? []).map((id) => bijschrift.get(id)));
      if (!opVariatie.has(foto)) taken.push({ objectId: variatie.id, foto, primair: true, label: `${slug}-${variantId}` });
    }
  }

  const ontbreekt = taken.filter((t) => !fs.existsSync(origineel(t.foto)));
  console.log(`${taken.length} foto's te uploaden (${ECHT ? "ECHT" : "droog"}); ${ontbreekt.length} bronbestanden ontbreken.`);
  for (const t of ontbreekt) console.log(`  ontbreekt: ${t.foto}`);
  if (!ECHT || ontbreekt.length) return;

  let gelukt = 0;
  for (const [n, t] of taken.entries()) {
    const buffer = await sharp(origineel(t.foto)).flatten({ background: "#ffffff" }).jpeg({ quality: 90 }).toBuffer();
    try {
      await client.catalog.images.create({
        request: {
          idempotencyKey: crypto.randomUUID(),
          objectId: t.objectId,
          image: { type: "IMAGE", id: "#studio", imageData: { name: t.label, caption: t.foto } } as never,
          isPrimary: t.primair,
        },
        imageFile: new Blob([new Uint8Array(buffer)], { type: "image/jpeg" }) as never,
      });
      gelukt++;
    } catch (err) {
      console.error(`Mislukt: ${t.label}`, JSON.stringify((err as { body?: unknown }).body ?? String(err)));
    }
    if ((n + 1) % 20 === 0) console.log(`  ${n + 1}/${taken.length}`);
  }
  console.log(`Klaar: ${gelukt}/${taken.length} foto's in Square.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
