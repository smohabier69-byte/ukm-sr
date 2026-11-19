import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const test = globalThis;
test.__dbRows=[]; test.__updates=[]; test.__deny=false; test.__race=false;
const stubs={ 'next/server': 'export const NextResponse=Response;',
 '@/lib/db/schema':`export const bestellingen={bestelnummer:'number',bericht:'message',gegevens:'data',afgeleverdOp:'delivered',aangemaaktOp:'created'};`,
 '@/lib/winkel/bot-toegang.server':`export const controleerBotToegang=()=>globalThis.__deny?new Response('{}',{status:401}):undefined;`,
 'drizzle-orm':`export const sql=(strings,...values)=>({strings:[...strings],values});export const and=(...v)=>({and:v});export const eq=(...v)=>({eq:v});export const gt=(...v)=>({gt:v});export const asc=(v)=>v;export const isNull=(v)=>({null:v});`,
 '@/lib/db/client':`export const db={select:()=>({from(){return this},where(w){globalThis.__where=w;return this},orderBy(){return this},async limit(){return globalThis.__dbRows}}),update:()=>({set(v){globalThis.__updates.push(v);return this},where(w){globalThis.__where=w;return this},async returning(){return globalThis.__race?[]:[{bestelnummer:'UKM-261119-1234'}]}})};`,
};
await build({entryPoints:['app/api/bestellingen/bevestiging/route.ts'],outfile:'.confirmation-api-test.mjs',bundle:true,platform:'node',format:'esm',packages:'external',plugins:[{name:'isolated-db',setup(b){b.onResolve({filter:/^(next\/server|drizzle-orm|@\/lib\/db\/client|@\/lib\/db\/schema|@\/lib\/winkel\/bot-toegang.server)$/},a=>({path:a.path,namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:stubs[a.path],loader:'js'}));}}]});
const api=await import(pathToFileURL(resolve('.confirmation-api-test.mjs')).href);
let count=0;
async function post(status,expected,phone='5978765432'){
 const response=await api.POST(new Request('https://test/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bestelnummer:'UKM-261119-1234',telefoon:phone,status})}));assert.equal(response.status,expected);count++;return response;
}
function row(status){test.__dbRows=[{gegevens:{contact:{telefoon:'8765432'},bevestiging:{status}}}];}
test.__deny=true;await post('bevestigd',401);assert.equal((await api.GET(new Request('https://test/api'))).status,401);test.__deny=false;count++;
row('wacht_op_bot');await post('bevestigd',409);await post('wacht_op_klant',200);await post('controle',200);await post('geannuleerd',200);
row('wacht_op_klant');await post('bevestigd',200);await post('controle',200);await post('geannuleerd',200);await post('wacht_op_bot',409);await post('bevestigd',404,'5978000000');
for(const status of ['controle','geannuleerd','bevestigd']){row(status);await post('bevestigd',status==='bevestigd'?200:409);await post(status,200);}
row('wacht_op_klant');test.__race=true;await post('bevestigd',409);test.__race=false;
assert.ok(JSON.stringify(test.__where).includes('status'));
assert.equal((await api.GET(new Request('https://test/api?na=malicious'))).status,400);count++;
test.__dbRows=[];const page=await (await api.GET(new Request('https://test/api'))).json();assert.deepEqual(page,{bestellingen:[],volgende:''});count++;
assert.equal((await api.GET(new Request('https://test/api?telefoon=bad'))).status,400);count++;
await api.GET(new Request('https://test/api?telefoon=5978765432'));assert.ok(JSON.stringify(test.__where).includes('5978765432'));count++;
console.log(JSON.stringify({apiChecks:count,database:'isolated',realOrders:0}));
