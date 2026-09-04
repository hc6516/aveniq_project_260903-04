import Image from 'next/image';
import SignupForm from './signup-form';
import { getConfig } from '../lib/config.mjs';
export const dynamic = 'force-dynamic';

export default function Home() {
  const config = getConfig();
  return <main>
    <section className="hero" aria-labelledby="hero-title"><div className="hero-copy">
      <p className="eyebrow"><span className="dot"/> SMART WELLNESS SELECTION</p>
      <h1 id="hero-title">나를 위한 한 잔,<br/><em>부담 없이 매일.</em></h1>
      <p className="intro">단백질 드링크부터 산뜻한 과일티까지.<br/>내 취향대로 챙기는 데일리 웰니스, AVENIQ.</p>
      <a className="button" href="#signup">출시 알림 신청하기 <span aria-hidden="true">↗</span></a>
      <p className="hero-note">첫 구매 1,000원 할인 · 출시 예정 혜택</p>
    </div><div className="hero-visual"><Image src="/tea.webp" alt="AVENIQ 3PM STICK TEA 패키지와 유자빛 티 한 잔의 제품 콘셉트" fill sizes="(max-width: 760px) 100vw, 55vw" priority/><p className="image-note">티 제품 콘셉트 · 구성·원료·표시사항은 출시 시 확정</p></div></section>
    <section className="brand-story" aria-labelledby="brand-title"><p className="eyebrow">EVERYDAY, YOUR WAY</p><h2 id="brand-title">거창한 관리보다,<br/>내가 좋아하는 한 잔부터.</h2><p>일상 가까이에서 만나는 합리적인 웰니스 음료를 준비합니다.<br/>편의점과 생활용품점에서도 부담 없이 고를 수 있도록.</p><div className="range"><article><span>01 / PROTEIN DRINK</span><h3>단백질 드링크</h3><p>바쁜 일상에 간편하게 더하는 한 잔.<br/>취향에 맞는 단백질 음료를 준비 중입니다.</p></article><article><span>02 / FRUIT TEA</span><h3>과일티</h3><p>잠깐의 여유에 산뜻한 맛을 더하는 한 잔.<br/>과일의 풍미를 담은 티를 준비 중입니다.</p></article></div><p className="fine">제품군 기획 단계이며 출시 품목·성분·영양정보는 확정 후 안내합니다. 특정 유통 채널 입점은 확정되지 않았습니다.</p></section><section className="benefit" aria-labelledby="benefit-title"><div><p className="eyebrow">FIRST SIP, FIRST BENEFIT</p><h2 id="benefit-title">첫 만남은<br/>조금 더 가볍게.</h2></div><div className="price-panel"><span className="pill">첫 구매 1,000원 할인 예정</span><div className="price"><del>3,900원</del><span aria-hidden="true">→</span><strong>2,900<span>원</span></strong></div><p>알림 신청자에게 준비하는 첫 구매 혜택.<br/>출시 일정과 쿠폰 이용 방법을 함께 안내할 예정입니다.</p><p className="fine">기획 기준가 3,900원 · 적용 상품·구성은 확정 후 안내<br/>고객당 1회 · 쿠폰 발급 후 7일 이내 사용 예정<br/>출시일과 판매처는 확정 후 안내합니다. 현재 결제는 진행되지 않습니다.</p></div></section>
    <section className="signup-section" id="signup" aria-labelledby="signup-title"><div className="signup-copy"><p className="eyebrow">BE THE FIRST</p><h2 id="signup-title">새로운 루틴의<br/>시작을 함께해요.</h2><p>출시 알림 신청하고,<br/>첫 구매 1,000원 할인 소식 만나기.</p><ol className="steps"><li><span>01</span> 알림 신청</li><li><span>02</span> 출시 소식 확인</li><li><span>03</span> 첫 구매 혜택 사용</li></ol><p className="fine">광고성 할인·이벤트 메시지는 선택한 수신 채널에 동의한 경우에만 발송합니다.</p></div><SignupForm enabled={config.enabled} days={config.days}/></section>
  </main>;
}
