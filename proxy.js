import {NextResponse} from 'next/server';
export function proxy(){const r=NextResponse.next();r.headers.set('Cache-Control','no-store');r.headers.set('X-Robots-Tag','noindex, nofollow');return r;}
export const config={matcher:['/tools/:path*','/api/channels','/api/utm-links','/api/stats','/api/tools-login']};
