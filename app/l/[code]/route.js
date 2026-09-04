import {db} from '../../../lib/tracking-server.mjs';
import {makeUrl,isBot,device,SITE_ORIGIN} from '../../../lib/utm.mjs';
export const dynamic='force-dynamic';
export const runtime='nodejs';
async function redirect(r,{params}){
 const {code}=await params;
 let target=makeUrl({source:'short-link',medium:'unknown'});
 try{
 if(/^[a-z0-9._-]{1,64}$/.test(code)){
 const rows=await db('aveniq_links?short_code=eq.'+encodeURIComponent(code)+'&select=source,medium,campaign,content,term');
 if(rows.length){target=makeUrl(rows[0]);
 if(!isBot(r.method,r.headers.get('user-agent'))){let host='';try{host=new URL(r.headers.get('referer')).hostname;}catch{}
 try{await db('rpc/aveniq_record_click',{method:'POST',body:{p_code:code,p_device:device(r.headers.get('user-agent')),p_referer:host}});}catch{console.error('AVENIQ click write failed');}}
 }
 }
 }catch{console.error('AVENIQ short link lookup failed');}
 return new Response(null,{status:302,headers:{Location:target,'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
}
export const GET=redirect;export const HEAD=redirect;
