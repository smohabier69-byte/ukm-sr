/**
 * Rendert PDF-pagina's naar JPEG (los of als contactvel) om de prijslijsten
 * visueel na te kunnen lopen. Gebruikt @napi-rs/canvas, dat pdfjs-dist al
 * als optionele afhankelijkheid meebrengt.
 *
 *   node scripts/render-catalog-pages.mjs <uitvoermap> [--breedte=420] [--vel=8] slug=<pad.pdf> ...
 *   node scripts/render-catalog-pages.mjs <uitvoermap> --los --breedte=1200 [--paginas=3,5-9] slug=<pad.pdf>
 */
import fs from "node:fs";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const [outDir, ...rest] = process.argv.slice(2);
const optie = (naam, standaard) => {
  const a = rest.find((r) => r.startsWith(`--${naam}=`));
  return a ? a.split("=")[1] : standaard;
};
const breedte = Number(optie("breedte", 420));
const perVel = Number(optie("vel", 8));
const los = rest.includes("--los");
const paginaFilter = optie("paginas", "");
const bronnen = rest
  .filter((a) => !a.startsWith("--") && a.includes("="))
  .map((a) => ({ slug: a.slice(0, a.indexOf("=")), pdf: a.slice(a.indexOf("=") + 1) }));

fs.mkdirSync(outDir, { recursive: true });

function gekozen(aantal) {
  if (!paginaFilter) return Array.from({ length: aantal }, (_, i) => i + 1);
  const set = new Set();
  for (const deel of paginaFilter.split(",")) {
    const [a, b] = deel.split("-").map(Number);
    for (let n = a; n <= (b ?? a); n++) set.add(n);
  }
  return [...set].filter((n) => n >= 1 && n <= aantal).sort((x, y) => x - y);
}

for (const { slug, pdf } of bronnen) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pdf)), useSystemFonts: true }).promise;
  const nummers = gekozen(doc.numPages);
  let vel = [];
  let velIndex = 0;

  const schrijfVel = () => {
    if (!vel.length) return;
    const kolommen = Math.min(4, vel.length);
    const rijen = Math.ceil(vel.length / kolommen);
    const h = Math.max(...vel.map((v) => v.canvas.height));
    const canvas = createCanvas(kolommen * breedte, rijen * (h + 26));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    vel.forEach((v, i) => {
      const x = (i % kolommen) * breedte;
      const y = Math.floor(i / kolommen) * (h + 26);
      ctx.drawImage(v.canvas, x, y + 26);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(`${slug} p${v.n}`, x + 8, y + 19);
    });
    velIndex++;
    const naam = `${slug}-vel-${String(velIndex).padStart(2, "0")}.jpg`;
    fs.writeFileSync(path.join(outDir, naam), canvas.toBuffer("image/jpeg", 80));
    vel = [];
  };

  for (const n of nummers) {
    const page = await doc.getPage(n);
    const basis = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: breedte / basis.width });
    const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    if (los) {
      const naam = `${slug}-p${String(n).padStart(3, "0")}.jpg`;
      fs.writeFileSync(path.join(outDir, naam), canvas.toBuffer("image/jpeg", 86));
    } else {
      vel.push({ n, canvas });
      if (vel.length === perVel) schrijfVel();
    }
    page.cleanup();
  }
  schrijfVel();
  console.log(`${slug}: ${nummers.length} pagina's gerenderd`);
  await doc.destroy();
}
