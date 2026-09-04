import Image from 'next/image';
import SignupForm from './signup-form';
import { getConfig } from '../lib/config.mjs';
export const dynamic = 'force-dynamic';

export default function Home() {
  const config = getConfig();
  return <main>
    <section className="hero" aria-labelledby="hero-title"><div className="hero-copy">
      <p className="eyebrow"><span className="dot"/> A NEW DAILY ROUTINE</p>
      <h1 id="hero-title">바쁜 하루에도,<br/>나를 챙기는<br/><em>한 모금.</em></h1>
      <p className="intro">가방에 쏙, 일상에 가볍게.<br/>AVENIQ 단백질 드링크를 가장 먼저 만나보세요.</p>
      <a className="button" href="#signup">출시 알림 신청하기 <span aria-hidden="true">↗</span></a>
      <p className="hero-note">첫 구매 1,000원 할인 혜택 · 출시 준비 중</p>
    </div><div className="hero-visual"><Image src="/product.webp" alt="파란색과 흰색 AVENIQ 단백질 드링크 패키지 콘셉트 이미지" fill sizes="(max-width: 760px) 100vw, 55vw" priority/><div className="visual-tag">YOUR DAY.<br/>YOUR PACE.</div><p className="image-note">패키지 콘셉트 이미지 · 실제 제품과 다를 수 있습니다.</p></div></section>
    <section className="benefit" aria-labelledby="benefit-title"><div><p className="eyebrow">FIRST SIP, FIRST BENEFIT</p><h2 id="benefit-title">첫 만남은<br/>조금 더 가볍게.</h2></div><div className="price-panel"><span className="pill">첫 구매 1,000원 할인</span><div className="price"><del>3,900원</del><span aria-hidden="true">→</span><strong>2,900<span>원</span></strong></div><p>알림 신청자에게 준비한 첫 구매 혜택.<br/>출시 일정과 쿠폰 이용 방법을 함께 안내할 예정입니다.</p><p className="fine">고객당 1회 · 쿠폰 발급 후 7일 이내 사용 예정<br/>출시일과 판매처는 확정 후 안내합니다. 현재 결제는 진행되지 않습니다.</p></div></section>
    <section className="signup-section" id="signup" aria-labelledby="signup-title"><div className="signup-copy"><p className="eyebrow">BE THE FIRST</p><h2 id="signup-title">새로운 루틴의<br/>시작을 함께해요.</h2><p>출시 알림 신청하고,<br/>첫 구매 1,000원 할인 받기.</p><ol className="steps"><li><span>01</span> 알림 신청</li><li><span>02</span> 출시 소식 확인</li><li><span>03</span> 첫 구매 혜택 사용</li></ol><p className="fine">광고성 할인·이벤트 메시지는 선택한 수신 채널에 동의한 경우에만 발송합니다.</p></div><SignupForm enabled={config.enabled} days={config.days}/></section>
  </main>;
}
