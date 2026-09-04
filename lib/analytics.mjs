export const GA_ID = 'G-LBVCLJ26EP'; // Public measurement ID, not a credential.
export const CONSENT_KEY = 'aveniq.analytics-consent.v1';
const EVENTS = new Set(['launch_cta_click', 'signup_form_start', 'signup_submit_error', 'generate_lead']);
export function analyticsAllowed() {
  if (typeof window === 'undefined' || window.location.hostname !== 'aveniq-launch-page.vercel.app' || window.location.pathname !== '/') return false;
  try { return localStorage.getItem(CONSENT_KEY) === 'granted'; } catch { return false; }
}
export function track(name) {
  if (!EVENTS.has(name) || !analyticsAllowed() || typeof window.gtag !== 'function') return;
  window.gtag('event', name, { send_to: GA_ID, page_location: 'https://aveniq-launch-page.vercel.app/', page_title: 'AVENIQ', page_referrer: '' });
}
export function campaignParams(search) {
  const params = new URLSearchParams(search);
  const result = {};
  for (const [utm, ga] of Object.entries({source:'source',medium:'medium',campaign:'name',content:'content',term:'term'})) {
    const value = params.get(`utm_${utm}`) || '';
    if (/^[a-z0-9._-]{1,80}$/.test(value) && !/\d{9,}/.test(value.replace(/[-.]/g,''))) result[`campaign_${ga}`] = value;
  }
  return result;
}

