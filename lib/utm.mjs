export const SITE_ORIGIN='https://aveniq-launch-page.vercel.app';
export const CAMPAIGN='aveniq-launch-20260928';
export const UTM_KEYS=['source','medium','campaign','content','term'];
export function normalize(value){return String(value??'').trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9._-]/g,'').slice(0,80);}
export function makeUrl(values){const u=new URL('/',SITE_ORIGIN);for(const k of UTM_KEYS){const v=normalize(values[k]);if(v)u.searchParams.set('utm_'+k,v);}return u.href;}
export function captureAttribution(search,stored=null){
 const p=new URLSearchParams(search),has=UTM_KEYS.some(k=>p.has('utm_'+k));
 const out={landing_path:'/'};
 for(const k of UTM_KEYS)out['utm_'+k]=normalize(has?p.get('utm_'+k):stored?.['utm_'+k]);
 return out;
}
export function isBot(method,ua){return method==='HEAD'||!ua||/bot|crawler|spider|facebookexternalhit|kakaotalk-scrap|slack|discord|yeti|preview|headless|lighthouse/i.test(ua);}
export function device(ua){return /mobile|android|iphone|ipad/i.test(ua)?'mobile':/windows|macintosh|linux/i.test(ua)?'desktop':'other';}
export function suggestion(channel,links,date=new Date()){
 if(channel.content_mode==='none')return '';
 const prefix=normalize(channel.content_prefix)||'item';
 if(channel.content_mode==='date')return date.toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}).replaceAll('-','');
 if(channel.content_mode==='serial'){const n=links.filter(l=>l.channel_id===channel.id).reduce((max,l)=>l.content.startsWith(prefix)?Math.max(max,Number(l.content.slice(prefix.length))||0):max,0);return prefix+String(n+1).padStart(2,'0');}
 return '';
}
export function dateRange(from,to){
 const parse=(s)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('날짜 형식을 확인해 주세요.');const d=new Date(s+'T00:00:00+09:00');if(!Number.isFinite(+d)||d.toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'})!==s)throw Error('올바른 날짜가 아닙니다.');return d;};
 const a=from?parse(from):null,b=to?new Date(+parse(to)+86400000):null;
 if(a&&b&&a>=b)throw Error('시작일은 종료일 이후일 수 없습니다.');
 return {p_from:a?.toISOString()??null,p_to:b?.toISOString()??null};
}
