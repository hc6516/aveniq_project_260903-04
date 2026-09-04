import {createHash,createHmac,timingSafeEqual,randomBytes} from 'node:crypto';
import {SITE_ORIGIN,normalize,makeUrl,dateRange} from './utm.mjs';
export const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
export function authorized(request,env=process.env){
 const expected=env.UTM_ADMIN_PASSWORD;
 if(!expected||expected.length<20)return false;
 const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('aveniq_admin='))?.slice(13);
 if(cookie){const [exp,signature]=cookie.split('.');if(/^\d+$/.test(exp)&&Number(exp)>Date.now()&&Number(exp)<=Date.now()+86400000&&/^[a-f0-9]{64}$/.test(signature)){const expectedSig=createHmac('sha256',expected).update(exp).digest('hex');if(signature.length===expectedSig.length&&timingSafeEqual(Buffer.from(signature),Buffer.from(expectedSig)))return true;}}
 const header=request.headers.get('authorization')||'';
 if(!header.startsWith('Basic '))return false;
 try{const decoded=Buffer.from(header.slice(6),'base64').toString('utf8');const value=decoded.slice(decoded.indexOf(':')+1);
 return timingSafeEqual(createHash('sha256').update(value).digest(),createHash('sha256').update(expected).digest());}catch{return false;}
}
export function guard(request){
 if(!authorized(request))return new Response('관리자 인증이 필요합니다.',{status:401,headers:{'WWW-Authenticate':'Basic realm="AVENIQ tools", charset="UTF-8"','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
 if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'허용되지 않은 요청입니다.'},403);
}
export async function readBody(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw Error('JSON 요청만 허용됩니다.');
 const reader=request.body?.getReader();if(!reader)throw Error('요청 내용이 없습니다.');
 let size=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16384){await reader.cancel();throw Error('요청이 너무 큽니다.');}parts.push(value);}
 return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
export async function db(path,{method='GET',body,headers={}}={}){
 const key=process.env.SUPABASE_SECRET_KEY;
 const origin=process.env.SUPABASE_URL;
 if(!key||!origin)throw Error('서버 DB 설정이 필요합니다.');
 const u=new URL(origin);if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co'))throw Error('DB 주소 설정을 확인해 주세요.');
 const r=await fetch(new URL('/rest/v1/'+path,u),{method,headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!r.ok){const err=new Error(r.status===409?'같은 코드가 이미 있습니다. 다른 코드를 입력해 주세요.':'DB 작업에 실패했습니다.');err.status=r.status;throw err;}
 return r.status===204?null:r.json();
}
export async function allRows(path){
 const rows=[];for(let start=0;;start+=1000){const page=await db(path,{headers:{Range:start+'-'+(start+999),'Range-Unit':'items'}});rows.push(...page);if(page.length<1000)return rows;if(rows.length>=100000)throw Error('데이터가 많아 조회 범위 조정이 필요합니다.');}
}
export async function metrics(range={p_from:null,p_to:null}){return db('rpc/aveniq_link_metrics',{method:'POST',body:range});}
export async function ledger(){
 const [channels,links,counts]=await Promise.all([allRows('aveniq_channels?order=sort.asc,created_at.asc'),allRows('aveniq_links?order=created_at.desc'),metrics()]);
 const map=new Map(counts.map(c=>[c.link_id,c]));return {channels,links:links.map(l=>({...l,conversions:Number(map.get(l.id)?.conversions||0)}))};
}
export async function createLinks(body){
 const manual=body.manual===true;
 const ids=Array.isArray(body.channelIds)?[...new Set(body.channelIds)]:[];
 if(!manual&&(!ids.length||ids.length>20))throw Error('채널을 1~20개 선택해 주세요.');
 if(ids.some(x=>!/^[-a-f0-9]{36}$/.test(x)))throw Error('채널을 확인해 주세요.');
 const channels=manual?[null]:await db('aveniq_channels?id=in.('+ids.join(',')+')&active=eq.true');
 if(!manual&&channels.length!==ids.length)throw Error('숨겨졌거나 없는 채널입니다.');
 if(body.short_code&&channels.length!==1)throw Error('직접 단축 코드는 한 링크에만 지정할 수 있습니다.');
 if(body.landing_path&&body.landing_path!=='/')throw Error('허용된 랜딩은 홈페이지입니다.');
 const out=[];
 for(const ch of channels){
 const v={landing_path:'/',source:normalize(body.source||ch?.source),medium:normalize(body.medium||ch?.medium),campaign:normalize(body.campaign),content:normalize(body.content),term:normalize(body.term)};
 if(!v.source||!v.medium||!v.campaign)throw Error('source, medium, campaign에 영문 값을 입력해 주세요.');
 const params=new URLSearchParams({select:'*'});for(const [k,val] of Object.entries(v))params.set(k,'eq.'+val);
 const existing=await db('aveniq_links?'+params);if(existing.length){out.push({...existing[0],reused:true});continue;}
 const code=body.short_code?normalize(body.short_code).slice(0,64):(ch?.code||'link')+'-'+randomBytes(5).toString('hex');
 if(!code)throw Error('단축 코드를 확인해 주세요.');
 const data={...v,channel_id:ch?.id??null,url:makeUrl(v),short_code:code,label:String(body.label||((ch?.name||'수동')+' · '+(v.content||v.campaign))).slice(0,160),created_by:String(body.created_by||'').slice(0,80)};
 try{const [row]=await db('aveniq_links',{method:'POST',body:data,headers:{Prefer:'return=representation'}});out.push(row);}
 catch(e){if(e.status!==409)throw e;const dup=await db('aveniq_links?'+params);if(!dup.length)throw e;out.push({...dup[0],reused:true});}
 }return out;
}
export async function stats(search){
 const range=dateRange(search.get('from'),search.get('to'));
 const [links,channels,counts,daily]=await Promise.all([allRows('aveniq_links?order=created_at.desc'),allRows('aveniq_channels?order=sort.asc'),metrics(range),db('rpc/aveniq_daily_metrics',{method:'POST',body:range})]);
 const m=new Map(counts.map(c=>[c.link_id,c]));const material=links.map(l=>{const c=m.get(l.id);return {...l,clicks:Number(c?.clicks||0),conversions:Number(c?.conversions||0)};});
 const groups=[...channels,{id:null,name:'수동 링크'}].map(ch=>{const ls=material.filter(l=>l.channel_id===ch.id);return {id:ch.id,name:ch.name,clicks:ls.reduce((s,l)=>s+l.clicks,0),conversions:ls.reduce((s,l)=>s+l.conversions,0)};});
 return {channels:groups,materials:material,daily,summary:{clicks:material.reduce((s,l)=>s+l.clicks,0),conversions:material.reduce((s,l)=>s+l.conversions,0),active:links.filter(l=>!l.archived).length},timezone:'Asia/Seoul'};
}
