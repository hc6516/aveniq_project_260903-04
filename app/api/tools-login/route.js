import {createHmac} from 'node:crypto';
import {authorized,json,readBody} from '../../../lib/tracking-server.mjs';
export async function POST(request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'허용되지 않은 요청입니다.'},403);
 try{const {password}=await readBody(request);if(typeof password!=='string'||password.length>256)return json({error:'인증 실패'},401);
 const h=new Headers({authorization:'Basic '+Buffer.from('admin:'+password).toString('base64')});
 if(!authorized({headers:h}))return json({error:'비밀번호를 확인해 주세요.'},401);
 const exp=String(Date.now()+8*3600000),sig=createHmac('sha256',process.env.UTM_ADMIN_PASSWORD).update(exp).digest('hex');
 const r=json({ok:true});r.headers.set('Set-Cookie','aveniq_admin='+exp+'.'+sig+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800'+(process.env.NODE_ENV==='production'?'; Secure':''));return r;
 }catch{return json({error:'로그인 요청을 확인해 주세요.'},400);}
}
export async function DELETE(request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'허용되지 않은 요청'},403);
 const r=json({ok:true});r.headers.set('Set-Cookie','aveniq_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0; Secure');return r;
}
