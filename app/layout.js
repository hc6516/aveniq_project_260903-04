import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'AVENIQ — 가볍게 챙기는 나의 루틴',
  description: 'AVENIQ 단백질 드링크 출시 알림. 첫 구매 3,900원에서 2,900원으로 만나는 새로운 루틴.',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body>
    <header className="header"><Link href="/" className="wordmark" aria-label="AVENIQ 홈">AVENIQ<span>®</span></Link><a href="/#signup" className="nav-link">출시 알림 <span aria-hidden="true">↗</span></a></header>
    {children}
    <footer className="footer"><div><Link href="/" className="wordmark small">AVENIQ</Link><p>가볍게 챙기는, 나의 새로운 루틴.</p></div><nav aria-label="정책 안내"><Link href="/privacy">개인정보 처리방침</Link><Link href="/marketing">광고성 정보 수신 안내</Link><Link href="/terms">이용 안내</Link></nav><p className="fine">© 2026 AVENIQ · 출시 준비 프로젝트<br/>본 페이지는 CU 및 다른 브랜드의 공식 판매 페이지가 아닙니다.</p></footer>
  </body></html>;
}
