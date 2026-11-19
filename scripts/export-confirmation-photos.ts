import { brillenInvoer } from '../data/catalogus/brillen';
import { lenzenInvoer } from '../data/catalogus/lenzen';
import { catalogusfoto } from '../lib/winkel/catalogusfoto';
import { writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const fotos: Record<string,string>={};
let products=0, variants=0;
for(const p of [...brillenInvoer,...lenzenInvoer]) {
 const v='varianten' in p && p.varianten?.length?p.varianten:[undefined];
 for(const variant of v) {
  const path=catalogusfoto(p.slug,variant?.id);
  if(!path || !existsSync('public'+path))throw new Error('Missing exact catalog photo: '+p.slug+' '+variant?.id);
  if(path.includes('/studio/'))throw new Error('Studio reconstruction used');
  fotos[path]='webconfirm-'+createHash('sha256').update(path).digest('hex').slice(0,24)+'.jpg';
  variants++;
 }
 products++;
}
writeFileSync('../website-confirmation-photos.json',JSON.stringify(fotos,null,2));
console.log(JSON.stringify({products,variants,uniquePhotos:Object.keys(fotos).length,originalCatalogPhotosOnly:true}));
