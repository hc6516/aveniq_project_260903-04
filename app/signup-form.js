'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { captureAttribution } from '../lib/utm.mjs';
function attribution(){let old=null;try{old=JSON.parse(sessionStorage.getItem('aveniq.utm'));}catch{}const value=captureAttribution(window.location.search,old);try{sessionStorage.setItem('aveniq.utm',JSON.stringify(value));}catch{}return value;}

export default function SignupForm({ enabled, days }) {
  useEffect(()=>{attribution();},[]);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (!enabled || status === 'pending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('pending'); setMessage('');
    try {
      const response = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attribution: attribution(), phone: data.get('phone'), email: data.get('email'), privacy: data.get('privacy') === 'on', adult: data.get('adult') === 'on', sms: data.get('sms') === 'on', emailMarketing: data.get('emailMarketing') === 'on', website: data.get('website') }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      setStatus('success'); setMessage('신청이 접수되었습니다. 쿠폰은 아직 발급되지 않았으며, 출시 일정 확정 후 안내합니다.'); form.reset(); setEmailMarketing(false);
    } catch (error) { setStatus('error'); setMessage(error.message || '연결이 원활하지 않습니다. 다시 시도해 주세요.'); }
  }
  if (status === 'success') return <div className="form-card success" role="status"><span className="success-icon">✓</span><h3>함께할 준비, 완료!</h3><p>{message}</p><button className="button secondary" onClick={() => {setStatus('idle'); setMessage('');}}>처음으로</button></div>;
  return <form className="form-card" onSubmit={submit} aria-label="출시 알림 신청">
    <div className="form-heading"><h3>출시 알림 신청</h3><span className="pill muted">{enabled ? '신청 접수 중' : '오픈 준비 중'}</span></div>
    {!enabled && <p className="notice" role="status">현재는 미리보기입니다. 운영자 정보와 개인정보 안내를 확정한 뒤 신청을 열 예정이며, 지금은 개인정보를 입력하거나 전송할 수 없습니다.</p>}
    <fieldset disabled={!enabled || status === 'pending'}><legend className="sr-only">신청 정보와 동의</legend>
      <label className="field">휴대폰 번호 <span className="required">필수</span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={13} pattern="010-?[0-9]{4}-?[0-9]{4}" placeholder="010-1234-5678"/></label>
      <label className="field">이메일 <span className="required">{emailMarketing ? '이메일 수신 동의 시 필수' : '선택'}</span><input name="email" type="email" autoComplete="email" required={emailMarketing} maxLength={254} placeholder="hello@example.com"/></label>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <div className="consents"><label><input type="checkbox" name="adult" required/><span>[필수] 만 14세 이상입니다.</span></label><label><input type="checkbox" name="privacy" required/><span>[필수] 개인정보 수집·이용에 동의합니다. <Link href="/privacy" target="_blank">내용 보기 ↗</Link></span></label><p className="consent-detail">휴대폰 번호(필수)와 이메일(선택)을 신청 접수 및 출시 안내에 이용합니다. 이메일을 입력하지 않아도 신청할 수 있습니다. 보관 기간: {days ? `${days}일` : '접수 전 확정 예정'}. 동의를 거부할 수 있으나 신청은 제한됩니다.</p><label><input type="checkbox" name="sms"/><span>[선택] 문자(SMS) 광고성 정보 수신 동의</span></label><label><input type="checkbox" name="emailMarketing" checked={emailMarketing} onChange={event => setEmailMarketing(event.target.checked)}/><span>[선택] 이메일 광고성 정보 수신 동의</span></label><p className="consent-detail">선택 동의 없이도 신청할 수 있습니다. 할인·이벤트 소식은 동의한 채널로만 안내합니다. <Link href="/marketing" target="_blank">자세히 ↗</Link></p></div>
      <button className="button submit" type="submit">{status === 'pending' ? '신청 저장 중…' : enabled ? '출시 알림 신청하기 ↗' : '곧 신청을 시작합니다'}</button>
    </fieldset><p className="form-status" role="status" aria-live="polite">{message}</p><p className="fine">결제 정보는 받지 않습니다. 실제 문자·이메일 발송은 아직 연결되지 않았습니다.</p>
  </form>;
}
