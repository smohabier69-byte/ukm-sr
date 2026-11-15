/**
 * Haalt productfoto's en tekst uit de UKM.sr prijslijst-PDF's (november 2026).
 * Opvolger van extract-catalog.mjs:
 *  - willekeurig aantal PDF's;
 *  - wacht ook op foto's die pdf.js asynchroon aanlevert (met alfakanaal of
 *    gedeeld over meerdere pagina's), die het oude script oversloeg;
 *  - bewaart per foto de positie op de pagina, zodat pagina's met meerdere
 *    producten betrouwbaar uit elkaar te halen zijn;
 *  - schrijft WebP via sharp en slaat exacte duplicaten over.
 *
 *   node scripts/extract-catalog-nov26.mjs [--text-only] slug=<pad.pdf> [slug=<pad.pdf> ...]
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_DIR = path.join(ROOT, "public", "producten", "nov26");
const OUT_FILE = path.join(ROOT, "scripts", "catalog-raw-nov26.json");

/** Kleinere bitmaps zijn keurmerken en decoratie, geen productfoto's. */
const MIN_EDGE = 300;
/** Langste zijde van een weggeschreven foto; de bron is vaak 3000px+. */
const MAX_EDGE = 1280;
const WEBP_KWALITEIT = 80;

const args = process.argv.slice(2);
const textOnly = args.includes("--text-only");
const bronnen = args
  .filter((a) => !a.startsWith("--") && a.includes("="))
  .map((a) => {
    const i = a.indexOf("=");
    return { slug: a.slice(0, i), pdf: a.slice(i + 1) };
  });
if (!bronnen.length) {
  console.error("Gebruik: node scripts/extract-catalog-nov26.mjs [--text-only] slug=<pad.pdf> ...");
  process.exit(1);
}

const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

/** Wacht tot pdf.js de bitmap heeft aangeleverd; `g_`-namen zijn documentbreed gedeeld. */
function haalBitmap(page, name) {
  const winkel = name.startsWith("g_") ? page.commonObjs : page.objs;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 20_000);
    try {
      winkel.get(name, (obj) => {
        clearTimeout(timer);
        resolve(obj);
      });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

async function extract(pdfPath, slug) {
  const outDir = path.join(IMAGE_DIR, slug);
  if (!textOnly) fs.mkdirSync(outDir, { recursive: true });

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];
  /** hash -> eerder weggeschreven bestand, om dubbele foto's maar een keer op te slaan. */
  const bekend = new Map();

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const [, , breedte, hoogte] = page.view;
    const ops = await page.getOperatorList();

    // Volg de transformatiematrix om te weten waar elke foto op de pagina staat.
    let ctm = [1, 0, 0, 1, 0, 0];
    const stapel = [];
    const plaatsingen = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn === pdfjs.OPS.save) stapel.push(ctm);
      else if (fn === pdfjs.OPS.restore) ctm = stapel.pop() ?? ctm;
      else if (fn === pdfjs.OPS.transform) ctm = mul(ctm, ops.argsArray[i]);
      else if (fn === pdfjs.OPS.paintImageXObject) {
        plaatsingen.push({
          name: ops.argsArray[i][0],
          x: Math.round(ctm[4]),
          y: Math.round(ctm[5]),
          w: Math.round(Math.abs(ctm[0]) || Math.abs(ctm[2])),
          h: Math.round(Math.abs(ctm[3]) || Math.abs(ctm[1])),
        });
      }
    }

    const images = [];
    const gezien = new Set();
    for (const p of plaatsingen) {
      const sleutel = `${p.name}@${p.x},${p.y}`;
      if (gezien.has(sleutel)) continue;
      gezien.add(sleutel);

      const bitmap = await haalBitmap(page, p.name);
      if (!bitmap?.data || bitmap.width < MIN_EDGE || bitmap.height < MIN_EDGE) continue;
      const kanalen = bitmap.kind === 2 ? 3 : bitmap.kind === 3 ? 4 : 0;
      if (!kanalen) continue;

      // Deel van de foto dat binnen de pagina valt (PDF-oorsprong linksonder).
      const zichtbaar = {
        x0: Math.max(0, p.x),
        y0: Math.max(0, p.y),
        x1: Math.min(breedte, p.x + p.w),
        y1: Math.min(hoogte, p.y + p.h),
      };
      const entry = {
        bronBreedte: bitmap.width,
        bronHoogte: bitmap.height,
        alfa: kanalen === 4,
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
        // Midden van het zichtbare deel, als fractie van de pagina, van linksboven gemeten.
        cx: +(((zichtbaar.x0 + zichtbaar.x1) / 2) / breedte).toFixed(2),
        cy: +(1 - (zichtbaar.y0 + zichtbaar.y1) / 2 / hoogte).toFixed(2),
        dekking: +(
          (Math.max(0, zichtbaar.x1 - zichtbaar.x0) * Math.max(0, zichtbaar.y1 - zichtbaar.y0)) /
          (breedte * hoogte)
        ).toFixed(2),
      };

      if (!textOnly) {
        const buffer = Buffer.from(bitmap.data.buffer, bitmap.data.byteOffset, bitmap.data.byteLength);
        const hash = crypto.createHash("sha1").update(buffer).digest("hex");
        const eerder = bekend.get(hash);
        if (eerder) {
          entry.src = eerder;
          entry.duplicaat = true;
        } else {
          const file = `${slug}-p${String(pageNumber).padStart(3, "0")}-${images.length + 1}.webp`;
          await sharp(buffer, { raw: { width: bitmap.width, height: bitmap.height, channels: kanalen } })
            .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
            .webp({ quality: WEBP_KWALITEIT })
            .toFile(path.join(outDir, file));
          entry.src = `/producten/nov26/${slug}/${file}`;
          bekend.set(hash, entry.src);
        }
      }
      images.push(entry);
    }

    const tekst = (await page.getTextContent()).items
      .filter((it) => it.str.trim())
      .map((it) => ({
        s: it.str,
        x: Math.round(it.transform[4]),
        y: Math.round(it.transform[5]),
        grootte: Math.round(Math.hypot(it.transform[0], it.transform[1])),
      }));

    pages.push({ page: pageNumber, breedte: Math.round(breedte), hoogte: Math.round(hoogte), tekst, images });
    page.cleanup();
    if (pageNumber % 10 === 0) console.log(`  ${slug}: pagina ${pageNumber}/${doc.numPages}`);
  }

  const pageCount = doc.numPages;
  await doc.destroy();
  return { slug, source: path.basename(pdfPath), pageCount, pages };
}

const catalogs = [];
for (const { slug, pdf } of bronnen) {
  console.log(`Start ${slug} (${path.basename(pdf)})`);
  catalogs.push(await extract(pdf, slug));
}
fs.writeFileSync(OUT_FILE, JSON.stringify(catalogs, null, 1));

for (const c of catalogs) {
  const alle = c.pages.flatMap((p) => p.images);
  console.log(`${c.slug}: ${c.pageCount} pagina's, ${alle.length} foto's (${alle.filter((i) => !i.duplicaat).length} uniek)`);
}
console.log(`Geschreven naar ${path.relative(ROOT, OUT_FILE)}`);
