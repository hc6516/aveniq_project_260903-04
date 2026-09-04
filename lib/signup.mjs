import { CONSENT_VERSION, getConfig } from './config.mjs';

export function validateSignup(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: '올바른 신청 정보를 입력해 주세요.' };
  if (body.website) return { error: '신청 정보를 확인해 주세요.' };
  if (body.privacy !== true || body.adult !== true) return { error: '필수 동의 항목을 확인해 주세요.' };
  if (typeof body.name !== 'string' || typeof body.phone !== 'string' || typeof body.email !== 'string') return { error: '이름, 휴대폰 번호, 이메일을 입력해 주세요.' };
  const name = body.name.trim();
  const phone = body.phone.replace(/[\s-]/g, '');
  const email = body.email.trim().toLowerCase();
  if (name.length < 1 || name.length > 60 || /[\x00-\x1f<>]/.test(name)) return { error: '이름은 1~60자로 입력해 주세요.' };
  if (!/^010\d{8}$/.test(phone)) return { error: '010으로 시작하는 휴대폰 번호를 입력해 주세요.' };
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return { error: '올바른 이메일 주소를 입력해 주세요.' };
  if (typeof body.sms !== 'boolean' || typeof body.emailMarketing !== 'boolean') return { error: '수신 동의 항목을 확인해 주세요.' };
  const channels = [...(body.sms ? ['sms'] : []), ...(body.emailMarketing ? ['email'] : [])];
  const now = new Date().toISOString();
  return { data: { name, phone, email, privacy_agreed_at: now, privacy_consent_version: CONSENT_VERSION, marketing_consent: channels.length > 0, marketing_consent_at: channels.length ? now : null, marketing_consent_channels: channels, marketing_consent_version: channels.length ? CONSENT_VERSION : null, source: 'aveniq-web-v2' } };
}

const reply = (body, status) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function handleSignup(request, env = process.env, fetcher = fetch) {
  // Fail closed before parsing or forwarding any visitor data.
  if (!getConfig(env).enabled) return reply({ error: '현재 출시 준비 중으로 신청 접수를 받지 않습니다.' }, 503);
  const origin = request.headers.get('origin');
  const allowed = new Set([env.SITE_URL, env.VERCEL_URL && `https://${env.VERCEL_URL}`, env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`].filter(Boolean).map(value => { try { return new URL(value).origin; } catch { return ''; } }));
  if (env.NODE_ENV !== 'production') allowed.add('http://localhost:3000');
  if (!origin || !allowed.has(origin)) return reply({ error: '허용되지 않은 요청입니다.' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({ error: 'JSON 형식으로 요청해 주세요.' }, 415);
  let supabaseUrl;
  try { supabaseUrl = new URL(env.SUPABASE_URL); } catch { return reply({ error: '접수 설정을 확인 중입니다.' }, 503); }
  if (supabaseUrl.protocol !== 'https:' || !supabaseUrl.hostname.endsWith('.supabase.co')) return reply({ error: '접수 설정을 확인 중입니다.' }, 503);
  if (Number(request.headers.get('content-length')) > 4096) return reply({ error: '요청이 너무 큽니다.' }, 413);
  let size = 0; const chunks = []; const reader = request.body?.getReader();
  if (!reader) return reply({ error: '신청 정보가 없습니다.' }, 400);
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 4096) { await reader.cancel(); return reply({ error: '요청이 너무 큽니다.' }, 413); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const result = validateSignup(JSON.parse(new TextDecoder().decode(bytes)));
    if (result.error) return reply({ error: result.error }, 400);
    const headers = { apikey: env.SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
    // Publishable key only: the existing INSERT-only RLS policy still applies.
    const response = await fetcher(new URL('/rest/v1/launch_signups', supabaseUrl), { method: 'POST', headers, body: JSON.stringify(result.data), signal: AbortSignal.timeout(8000), cache: 'no-store' });
    if (!response.ok) return reply({ error: '신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, 502);
    return reply({ ok: true }, 201);
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: '신청 정보 형식을 확인해 주세요.' }, 400);
    return reply({ error: '연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.' }, 502);
  }
}
