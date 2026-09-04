'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { GA_ID, CONSENT_KEY, campaignParams, track } from '../lib/analytics.mjs';

// Explicit configuration is needed for consent gating and URL redaction.
// Never mount the Google script before opt-in, on preview hosts or admin routes.
export default function Analytics() {
  const pathname = usePathname();
  const [choice, setChoice] = useState('loading');
  const [publicPage, setPublicPage] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const eligible = location.hostname === 'aveniq-launch-page.vercel.app' && location.pathname === '/';
    setPublicPage(eligible);
    window[`ga-disable-${GA_ID}`] = !eligible;
    if (!eligible) return;
    try { setChoice(localStorage.getItem(CONSENT_KEY) || 'pending'); } catch { setChoice('pending'); }
    const click = event => { if (event.target.closest?.('a[href="#signup"], a[href="/#signup"]')) track('launch_cta_click'); };
    document.addEventListener('click', click);
    return () => { document.removeEventListener('click', click); window[`ga-disable-${GA_ID}`] = true; };
  }, [pathname]);
  useEffect(() => {
    if (!publicPage || choice !== 'granted') return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: 'https://aveniq-launch-page.vercel.app/', page_referrer: '', page_title: 'AVENIQ',
      cookie_expires: 60 * 60 * 24 * 180, cookie_update: false,
      ...campaignParams(location.search)
    });
    setReady(true);
  }, [choice, publicPage]);
  function choose(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { setChoice('unavailable'); return; }
    // Reload clears any previously loaded Google tag when consent is withdrawn.
    if (value === 'denied') {
      window[`ga-disable-${GA_ID}`] = true;
      for (const item of document.cookie.split(';')) {
        const name = item.trim().split('=')[0];
        if (name === '_ga' || name.startsWith('_ga_')) {
          for (const domain of ['', ';domain=aveniq-launch-page.vercel.app', ';domain=.aveniq-launch-page.vercel.app']) document.cookie = `${name}=;max-age=0;path=/${domain}`;
        }
      }
      location.reload(); return;
    }
    setChoice(value);
  }
  if (!publicPage || choice === 'loading') return null;
  return <>
    {ready && choice === 'granted' && <Script id="aveniq-ga4" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive"/>}
    <aside aria-label="방문 분석 설정" style={{padding:'16px 24px',background:'#f4f1e9',color:'#182c30',fontSize:14}}>
      <p>선택적 방문 분석: 동의하면 Google Analytics가 쿠키를 사용해 방문과 신청 흐름을 분석합니다. 거부해도 사이트 이용에는 영향이 없습니다. <a href="/privacy">자세히 보기</a></p>
      {choice === 'granted' ? <button type="button" onClick={()=>choose('denied')}>분석 동의 철회</button> : <>
        <button type="button" onClick={()=>choose('granted')}>방문 분석 동의</button>{' '}
        {choice !== 'denied' && <button type="button" onClick={()=>choose('denied')}>동의하지 않음</button>}
        {choice === 'denied' && <span>현재 분석이 꺼져 있습니다.</span>}
        {choice === 'unavailable' && <span role="status">브라우저 저장소를 사용할 수 없어 분석을 시작하지 않았습니다.</span>}
      </>}
    </aside>
  </>;
}

