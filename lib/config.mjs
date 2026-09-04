export const CONSENT_VERSION = '2026-09-04-v2';
export function getConfig(env = process.env) {
  const operator = env.PRIVACY_OPERATOR?.trim() || '';
  const contact = env.PRIVACY_CONTACT_EMAIL?.trim() || '';
  const days = Number(env.PRIVACY_RETENTION_DAYS || 0);
  const legalReady = !!operator && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && Number.isInteger(days) && days > 0 && days <= 730 && env.PRIVACY_REVIEWED === 'true';
  return { operator, contact, days, legalReady, enabled: legalReady && env.SIGNUPS_ENABLED === 'true' && !!env.SUPABASE_URL && !!env.SUPABASE_SECRET_KEY };
}
