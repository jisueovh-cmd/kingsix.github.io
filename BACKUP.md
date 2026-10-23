# 취미 자파리(hobby-japari) — 전체 백업 문서

- 백업일: 2026-09-20
- 프로젝트 버전: 69
- 상태: SaaS Supabase 사용 (Readdy Backend 아님)

> 이 문서는 "다른 서버로 이전"을 대비한 설정/환경변수/데이터 정리용이다.
> 절대 Secret 값(비밀키)은 이 문서에 포함하지 않는다.

---

## 1. 외부 서비스 설정

### 1) Supabase (SaaS Supabase)
- **용도**: 인증(Auth), 데이터베이스(PostgreSQL), Storage(이미지/첨부), Edge Functions
- **코드 위치**: `src/lib/supabase.ts`, `src/lib/env.ts`
- **환경변수**: `VITE_PUBLIC_SUPABASE_URL`, `VITE_PUBLIC_SUPABASE_ANON_KEY`
- **데이터 저장 위치**: Supabase 프로젝트 (프로젝트 URL: dffsponfwoxpybdkvxlz.supabase.co)
- **별도 백업 필요**: DB 데이터 + Storage 이미지 (아래 3번 참고)

### 2) 카카오 로그인
- **용도**: 소셜 로그인 (Supabase 기본 OAuth provider `kakao` 사용)
- **코드 위치**:
  - `src/hooks/useAuth.tsx` (`signInWithOAuth('kakao')`)
  - `src/pages/auth/components/SocialLoginButtons.tsx`
- **설정 위치**:
  - Supabase Dashboard → Authentication → Providers → Kakao (Client ID + Client Secret)
  - 카카오 개발자센터 → 카카오 로그인 → Redirect URI 등록
- **참고**: `.env`의 `VITE_PUBLIC_KAKAO_CLIENT_ID`는 현재 `src/lib/env.ts`에서 읽지 않음(미사용). 실질 설정은 Supabase Dashboard 기준.
- **이전 시 필요 작업**: 새 Supabase에 Kakao provider 재설정 + 카카오 콘솔 Redirect URI 갱신(도메인 변경 시)

### 3) 네이버 로그인 / API
- **용도 2가지**:
  1. 네이버 로그인 (공식 JS SDK + `naver-auth` Edge Function)
  2. 네이버 뉴스 검색 API (트렌드 피드 프록시)
- **코드 위치**:
  - `src/hooks/useNaverLogin.ts`, `src/hooks/useAuth.tsx`
  - `src/pages/auth/components/SocialLoginButtons.tsx`
  - `supabase/functions/naver-auth/index.ts`
  - `supabase/functions/trend-feed/index.ts`, `supabase/functions/trend-diag/index.ts`
- **환경변수**:
  - 클라이언트: `VITE_PUBLIC_NAVER_CLIENT_ID`
  - Supabase Secrets: `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
- **이전 시 필요 작업**: 네이버 개발자센터 로그인 API + 검색 API 설정, Supabase Secrets 재등록

### 4) OpenAI API
- **용도**: AI 콘텐츠 자동 생성 (지역 정보, 지역 광고)
- **코드 위치**:
  - `supabase/functions/region-info-ai/index.ts`
  - `supabase/functions/gunpo-ad-ai/index.ts`
- **환경변수**: `OPENAI_API_KEY` (Supabase Secret)
- **모델**: `gpt-4o-mini`
- **이전 시 필요 작업**: Supabase Secrets에 `OPENAI_API_KEY` 재등록

### 5) Firebase
- **상태**: `package.json`에 `firebase@12.0.0` 존재하나, **실제 코드에서 import/사용 없음**
- **결론**: 미사용. 이전 시 무시해도 무방 (또는 제거 가능)

### 6) Stripe
- **상태**: `package.json`에 `@stripe/react-stripe-js` 존재하나, **실제 미사용** (project_plan.md에 "Stripe/결제: 불필요" 명시)
- **결론**: 미사용. 이전 시 무시해도 무방

---

## 2. 환경변수 목록 (이름/용도만, Secret 값 미포함)

### 클라이언트(.env, VITE_* 공개값)
| 이름 | 용도 |
| --- | --- |
| `VITE_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon(publishable) 키 |
| `VITE_PUBLIC_NAVER_CLIENT_ID` | 네이버 로그인 Client ID |
| `VITE_PUBLIC_KAKAO_CLIENT_ID` | 카카오 로그인 Client ID (현재 미사용) |
| `VITE_SITE_URL` | 사이트 최종 배포 도메인 |

### Supabase Secrets (Edge Function 전용, 비공개)
| 이름 | 용도 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API 키 |
| `NAVER_CLIENT_ID` | 네이버 검색 API Client ID |
| `NAVER_CLIENT_SECRET` | 네이버 검색 API Client Secret |
| `SUPABASE_URL` | Edge Function 내부용 Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function 내부용 service_role 키 |

---

## 3. 데이터 저장 위치 및 별도 백업 필요 여부

### Supabase DB 테이블 (9개) — 모두 별도 백업 필요
| 테이블 | 내용 |
| --- | --- |
| `profiles` | 회원 프로필 (username, nickname, avatar 등) |
| `posts` | 게시글 |
| `comments` | 댓글 |
| `boards` | 게시판 |
| `small_talk_messages` | 잡담(SMALL TALK) |
| `guestbook_entries` | 방명록 |
| `personal_records` | 개인 기록방 기록 |
| `room_visits` | 기록방 방문 기록 |
| `trend_snapshots` | 트렌드 스냅샷 |

### Supabase Auth
- 회원 계정은 `auth.users` 테이블에 저장 (Auth 스키마)
- **별도 백업 필요** (DB 덤프에 포함해야 함)

### Supabase Storage
- 이미지/첨부파일 업로드 위치 (`src/lib/storageUpload.ts` 사용, public bucket)
- **별도 백업 필요** (Storage 버킷의 파일들)

---

## 4. Edge Function 목록

### 배포된 함수 (7개)
| 함수 | 용도 | 로컬 소스 존재 |
| --- | --- | --- |
| Naver Auth | 네이버 로그인 세션 발급 | ✅ `supabase/functions/naver-auth/` |
| Trend Feed | 네이버 뉴스 검색 프록시 + 캐시 | ✅ `supabase/functions/trend-feed/` |
| Trend Diag | 네이버 API 키 진단 도구 | ✅ `supabase/functions/trend-diag/` |
| 지역 정보 AI | AI 지역정보 대량 생성 | ✅ `supabase/functions/region-info-ai/` |
| 경기남부 광고 AI | AI 지역 광고 생성 | ✅ `supabase/functions/gunpo-ad-ai/` |
| new-trend | (트렌드 관련) | ⚠️ 로컬 소스 없음 |
| Kakao Auth | (이전 직접구현 잔재, 현재 미사용) | ⚠️ 로컬 소스 없음 |

> ⚠️ **주의**: `new-trend`, `Kakao Auth` 두 함수는 Supabase에 배포만 되어 있고
> 로컬 소스 파일이 없다. 이전 시 Supabase Dashboard에서 함수 코드를 별도로 백업해야 한다.

---

## 5. Readdy 종속 부분

- **`vite.config.ts`의 define 값**: `__BASE_PATH__`, `__READDY_PROJECT_ID__`, `__READDY_VERSION_ID__`, `__READDY_AI_DOMAIN__` — Readdy가 빌드 시 주입. 다른 서버에서는 빈 문자열/기본값으로 대체되며 `__BASE_PATH__`는 "/" 로 폴백되어 동작.
- **이미지 CDN**: `src/lib/region.ts` 등에서 Readdy의 `search-image` 엔드포인트(readdy.ai)로 생성한 Flux 이미지 URL을 사용. Readdy CDN에 호스팅된 이미지라 인터넷만 있으면 외부에서도 로드됨(단, Readdy 서비스가 이미지 제공을 유지한다는 전제).
- **AutoImport**: `unplugin-auto-import` (NPM 패키지) — 독립 실행 가능.

---

## 6. 다른 서버 이전 절차 (요약)

1. Readdy Code 탭 → Download 버튼 → ZIP 다운로드 (전체 소스)
2. 로컬에서 `npm install`
3. `.env` 파일에 클라이언트 환경변수 설정 (위 2번 목록)
4. Supabase 프로젝트 유지 또는 새 프로젝트로 이전 (DB + Storage + Auth + Edge Functions)
5. Edge Function 재배포 (`new-trend`는 소스 백업 필요)
6. Supabase Secrets 재등록 (`OPENAI_API_KEY`, `NAVER_CLIENT_ID/SECRET` 등)
7. 카카오/네이버 개발자센터 Redirect URI 갱신 (도메인 변경 시)
8. `VITE_SITE_URL` 갱신