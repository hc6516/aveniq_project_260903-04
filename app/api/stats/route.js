import {guard,json,stats} from '../../../lib/tracking-server.mjs';
export const dynamic='force-dynamic';
export async function GET(r){const no=guard(r);if(no)return no;try{return json(await stats(new URL(r.url).searchParams));}catch(e){return json({error:e.message},503);}}
