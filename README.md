# AVENIQ launch page

Rebuilt Next.js 16.3.4 / React 19.2.8 landing page. Everyday wellness positioning includes planned protein drinks and fruit tea. No retailer affiliation is claimed. Supplied logo and Canva tea concept imagery are used; planned price applies to a future confirmed offer, not the pictured multipack. No checkout, coupon issuance or messaging provider is implemented.

## Run

Use Node.js 22+ and pnpm 11.19.0. Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`, then `pnpm start`.

## Privacy-first launch gate

By default **no personal data is accepted**. Inputs are disabled and POST /api/signup returns 503 before parsing the body or contacting Supabase. This is intentional because operator name, contact and retention period are unconfirmed.

Before opening collection, complete and review /privacy, /marketing and /terms, verify cross-border processing details and legal basis, choose a retention/deletion workflow, implement production-grade abuse/rate limiting, and test withdrawal procedures. Current basic validation/origin checks/honeypot are not a complete anti-abuse system. The public INSERT policy permits omitted name/email; email consent requires an email address. Review direct Data API abuse prevention before launch.

Set environment variables from .env.example in Vercel only after review. PRIVACY_REVIEWED=true is an explicit operator approval, not a guarantee of legal compliance. SIGNUPS_ENABLED=true additionally requires operator/contact/retention and Supabase configuration. SITE_URL must be the exact trusted production origin. Do not expose keys in NEXT_PUBLIC_* variables. Use SUPABASE_SECRET_KEY only on the server; never expose it in NEXT_PUBLIC_* variables.

Supabase target: dedicated `public.aveniq_signups`. Legacy `public.launch_signups` and its permissions are left untouched because cross-site ownership is not confirmed. Default metadata prevents indexing while launch preparation is incomplete.

## Verification

`pnpm test` covers gate behavior, input validation, consent records, origin/body limits and DB error sanitization. DB success is mocked: no fake leads are written during tests. Confirm a real, authorized test separately before opening collection.

## UTM 빌더 · 단축 링크 · 대시보드
- 빌더: /tools/utm
- 대시보드: /tools/dashboard
- 단축 링크: /l/<code>, 302 + Cache-Control: no-store
- 운영 기본 랜딩: https://aveniq-launch-page.vercel.app/
- 캠페인 기본값: aveniq-launch-20260928 (생성 후 UTM 식별자 불변)
- 현재 채널은 비어 있음. 실제 사용할 채널을 관리 패널에서 추가.
- 전환은 전용 신청 테이블의 저장 성공 **건수**. 고유 인원 수가 아님.
- 날짜는 한국시간, 종료일 포함. 활성 링크 수는 기간과 무관한 현재 값.
- 보관된 링크도 이동·집계를 유지. 삭제 API 없음.
- 클릭 로그는 원본 IP·전체 User-Agent를 저장하지 않음. 기기 분류와 referrer 호스트만 저장.
- 자동 로그 삭제는 하지 않음. 보관 정책은 운영 전 검토할 것.
- GA4는 필수 아님. 여기서는 클릭 대비 전환이며 GA4 방문 대비 전환과 분모가 다름.
- UTM 없는 기존 데이터는 임의 귀속하거나 소급 전환으로 계산하지 않음.

### 서버 설정
Vercel Production에 SUPABASE_URL, SUPABASE_SECRET_KEY, UTM_ADMIN_PASSWORD 설정 후 재배포.
UTM_ADMIN_PASSWORD는 암호학적으로 무작위 생성한 32자 이상을 권장(코드는 최소20자).
키/비밀번호는 코드·채팅·NEXT_PUBLIC_ 변수에 넣지 않음.
로그인은 8시간 HttpOnly/SameSite=Strict/Secure 쿠키. 비밀번호 변경 후 재배포하면 기존 세션 무효화.
서비스는 공개 회원가입이 아닌 소수 운영자를 위한 공용 관리자 도구. 인터넷 공개 운영 시 Vercel 방화벽의 로그인 엔드포인트 속도 제한을 추가 권장.
운영용 DB 키를 Preview/Development에 자동 공유하지 않음.
SIGNUPS_ENABLED 및 PRIVACY_REVIEWED는 계속 false/미설정. UTM 설치가 신청 접수 개방을 의미하지 않음.

### 사용법
1. /tools/utm에서 관리자 로그인.
2. 채널 관리에서 이름/code/source/medium/소재방식을 등록. 기존 source/medium/code는 변경하지 않음.
3. 채널을 하나 이상 선택. 소재 자동 제안은 직접 수정하면 중단.
4. 필요하면 고급 설정으로 캠페인/term을 지정. 직접 단축 코드는 한 링크에만 지정.
5. 생성 후 짧은 링크·긴 링크·전부 복사 또는 QR 다운로드.
6. 장부에서 검색·채널 필터·메모 수정·보관/복원.
7. /tools/dashboard에서 기간·채널·소재별 실적 확인.
8. 신규 채널 없이 수동 링크도 생성 가능. 실제 채널 값만 사용.

### 구현과 데이터
마이그레이션: supabase/migrations/20260904080454_aveniq_tracking.sql.
전용 테이블: aveniq_channels / aveniq_links / aveniq_clicks / aveniq_signups.
모두 RLS 활성화, anon/authenticated 테이블 접근 차단. 서버 service_role에만 권한.
SQL 집계 함수는 SECURITY INVOKER, PUBLIC/anon/authenticated 실행 금지.
UTM 조합 UNIQUE와 충돌 재조회로 중복 생성을 방지. 여러 채널 일괄 생성 중 일부 실패하면 이미 생성된 행은 유지되며 재시도 시 기존 링크를 반환.
미지 코드는 홈페이지에 utm_source=short-link&utm_medium=unknown 추가 후 이동.
알려진 코드의 DB 조회 장애도 동일 대체 링크로 이동하며 서버 로그에 실패 표시. DB 장애 때 클릭을 정확히 기록했다고 보장하지 않음.
봇 필터는 UA 기반 휴리스틱이라 사람 수를 보장하지 않음.
신청 attribution은 URL에 UTM 하나라도 있으면 해당 URL 전체 묶음 우선, 없을 때 sessionStorage 값 사용. 영문 허용값만 서버에서 재정규화.
기존 공유 가능 테이블은 수정·삭제하지 않으며 신규 AVENIQ 신청만 전용 테이블에 저장.

### 배포 전 체크리스트
- [x] 분리된 DB 마이그레이션 적용
- [x] anon 테이블/RPC 접근 차단 확인
- [x] 원자적 클릭+로그 함수 롤백 테스트
- [x] 로컬 단위 테스트 28개 통과
- [x] 로컬 배포 빌드 통과
- [ ] 운영 로그인·장부 생성·중복 링크 반환 검증
- [ ] 운영 일반 UA 클릭+1 / 봇·HEAD 클릭+0 / 미지 코드 확인
- [ ] 대시보드 실 DB 수치 대조
- [ ] 폼 개방 후 승인된 테스트로 실제 전환 저장 검증 (현재 접수 차단)
- [ ] 운영자 개인정보 안내/클릭 로그 보관 정책 검토
- [ ] 로그인 엔드포인트 방화벽 rate limit 검토

### 테스트 데이터
DB 함수 테스트는 트랜잭션/서브트랜잭션에서 실행 후 롤백했으며 저장된 테스트 링크는 0개.
운영 UI 테스트를 수행하면 이름에 QA 표시를 하고 결과를 별도 문서로 남긴다. 임의 삭제하지 않는다.
