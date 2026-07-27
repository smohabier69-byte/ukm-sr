/**
 * Haalt productfoto's en tekst uit de UKM.sr prijslijst-PDF's.
 *
 * De PDF's zijn Canva-exports: elke pagina is in feite één productkaart met een
 * of meer foto's plus losse tekstfragmenten. Foto's komen als ondoorzichtige
 * RGB-bitmaps binnen; badges en overlays hebben een alfakanaal en worden door
 * pdf.js asynchroon geladen - die uitzondering gebruiken we om ze te filteren.
 *
 *   node scripts/extract-catalog.mjs "<pad naar brillen.pdf>" "<pad naar lenzen.pdf>"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jpeg from "jpeg-js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_DIR = path.join(ROOT, "public", "producten");
const OUT_FILE = path.join(ROOT, "scripts", "catalog-raw.json");

/** Kleinere bitmaps zijn keurmerken en decoratie, geen productfoto's. */
const MIN_EDGE = 300;
const JPEG_QUALITY = 82;

/** pdf.js levert RGB_24BPP; jpeg-js verwacht RGBA. */
function toRgba({ width, height, data, kind }) {
  const out = Buffer.alloc(width * height * 4);
  if (kind === 2) {
    for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
      out[o] = data[i];
      out[o + 1] = data[i + 1];
      out[o + 2] = data[i + 2];
      out[o + 3] = 255;
    }
  } else if (kind === 3) {
    out.set(data);
  } else if (kind === 1) {
    for (let i = 0, o = 0; i < data.length; i += 1, o += 4) {
      out[o] = out[o + 1] = out[o + 2] = data[i];
      out[o + 3] = 255;
    }
  } else {
    return null;
  }
  return out;
}

/** Groepeert tekstfragmenten op y-positie tot leesbare regels. */
function textLines(textContent) {
  const rows = new Map();
  for (const item of textContent.items) {
    if (!item.str.trim()) continue;
    const key = Math.round(item.transform[5] / 6);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ s: item.str, x: item.transform[4] });
  }
  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, row]) =>
      row
        .sort((a, b) => a.x - b.x)
        .map((r) => r.s)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

async function extract(pdfPath, slug) {
  const outDir = path.join(IMAGE_DIR, slug);
  fs.mkdirSync(outDir, { recursive: true });

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const ops = await page.getOperatorList();

    const names = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjs.OPS.paintImageXObject) {
        const name = ops.argsArray[i][0];
        if (!names.includes(name)) names.push(name);
      }
    }

    const images = [];
    for (const name of names) {
      let bitmap;
      try {
        bitmap = page.objs.get(name);
      } catch {
        continue; // overlay met alfakanaal - geen productfoto
      }
      if (!bitmap?.data || bitmap.width < MIN_EDGE || bitmap.height < MIN_EDGE) continue;

      const rgba = toRgba(bitmap);
      if (!rgba) continue;

      const file = `${slug}-p${String(pageNumber).padStart(3, "0")}-${images.length + 1}.jpg`;
      const encoded = jpeg.encode({ data: rgba, width: bitmap.width, height: bitmap.height }, JPEG_QUALITY);
      fs.writeFileSync(path.join(outDir, file), encoded.data);
      images.push({ src: `/producten/${slug}/${file}`, width: bitmap.width, height: bitmap.height });
    }

    pages.push({ page: pageNumber, lines: textLines(await page.getTextContent()), images });
    page.cleanup();
  }

  await doc.destroy();
  return { slug, source: path.basename(pdfPath), pageCount: doc.numPages, pages };
}

const [brillenPdf, lenzenPdf] = process.argv.slice(2);
if (!brillenPdf || !lenzenPdf) {
  console.error("Gebruik: node scripts/extract-catalog.mjs <brillen.pdf> <lenzen.pdf>");
  process.exit(1);
}

const catalogs = [await extract(brillenPdf, "brillen"), await extract(lenzenPdf, "lenzen")];
fs.writeFileSync(OUT_FILE, JSON.stringify(catalogs, null, 2));

for (const c of catalogs) {
  const count = c.pages.reduce((n, p) => n + p.images.length, 0);
  console.log(`${c.slug}: ${c.pageCount} pagina's, ${count} foto's`);
}
console.log(`Geschreven naar ${path.relative(ROOT, OUT_FILE)}`);
