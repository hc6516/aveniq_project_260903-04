import './globals.css';
import './brand.css';
import './campaign.css';
import Link from 'next/link';
import Image from 'next/image';
import Analytics from './analytics';

export const metadata = {
  title: 'AVENIQ — 가볍게 챙기는 나의 루틴',
  description: '단백질 드링크부터 과일티까지, AVENIQ 데일리 웰니스 음료. 첫 구매 1,000원 할인 혜택을 준비 중입니다.',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body>
    <header className="header"><Link href="/" className="wordmark" aria-label="AVENIQ 홈"><Image src="/logo.png" alt="AVENIQ — Smart Wellness Selection" width={2135} height={736} priority/></Link><a href="/#signup" className="nav-link">출시 알림 <span aria-hidden="true">↗</span></a></header>
    {children}
    <Analytics />
    <footer className="footer"><div><Link href="/" className="wordmark small"><Image src="/logo.png" alt="AVENIQ" width={2135} height={736}/></Link><p>가볍게 챙기는, 나의 새로운 루틴.</p></div><nav aria-label="정책 안내"><Link href="/privacy">개인정보 처리방침</Link><Link href="/marketing">광고성 정보 수신 안내</Link><Link href="/terms">이용 안내</Link></nav><p className="fine">© 2026 AVENIQ · 출시 준비 프로젝트<br/>편의점·생활용품점 등 일상적인 유통 채널을 목표로 준비 중이며, CU·다이소 등 특정 업체의 입점·제휴는 확정되지 않았습니다.</p></footer>
  </body></html>;
}

