import {headers} from 'next/headers';
import {authorized} from '../../lib/tracking-server.mjs';
import Login from './login';
import './tools.css';
export const dynamic='force-dynamic';
export const metadata={title:'AVENIQ · 캠페인 관리',robots:{index:false,follow:false}};
export default async function ToolsLayout({children}){
 const h=await headers();
 if(!authorized({headers:h}))return <main className="tools"><p className="eyebrow">AVENIQ / PRIVATE WORKSPACE</p><h1>캠페인 관리</h1><p>링크와 성과를 확인하려면 관리자 비밀번호를 입력하세요.</p><Login/></main>;
 return <main className="tools"><nav aria-label="관리 도구"><a href="/tools/utm">UTM 링크 빌더</a><a href="/tools/dashboard">성과 대시보드</a></nav>{children}</main>;
}
