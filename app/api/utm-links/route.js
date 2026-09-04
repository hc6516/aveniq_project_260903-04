import {guard,json,readBody,db,ledger,createLinks} from '../../../lib/tracking-server.mjs';
export const dynamic='force-dynamic';
export async function GET(r){const no=guard(r);if(no)return no;try{return json(await ledger());}catch{return json({error:'リンクを読み込めません。DB設定を確認してください。'},503);}}
export async function POST(r){const no=guard(r);if(no)return no;try{return json({links:await createLinks(await readBody(r))},201);}catch(e){return json({error:e.message},400);}}
export async function PATCH(r){const no=guard(r);if(no)return no;try{const b=await readBody(r);if(!/^[a-f0-9-]{36}$/.test(b.id))throw Error('リンクを確認してください。');const v={};if(typeof b.archived==='boolean')v.archived=b.archived;if(typeof b.label==='string')v.label=b.label.slice(0,160);return json(await db('aveniq_links?id=eq.'+b.id,{method:'PATCH',body:v,headers:{Prefer:'return=representation'}}));}catch(e){return json({error:e.message},400);}}
