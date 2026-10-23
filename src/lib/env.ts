// 중앙 환경설정 모듈.
// 클라이언트에서 쓰는 모든 환경변수(VITE_*)를 여기 한곳에서 읽는다.
//
// 다른 호스팅(Vercel/AWS Amplify/Netlify 등)에 배포할 때는 아래 4개 값만
// 해당 플랫폼의 "환경변수(Environment Variables)" 메뉴에 등록하면 된다.
// (키 이름은 그대로 유지)
//
//   VITE_PUBLIC_SUPABASE_URL        -> Supabase Project URL
//   VITE_PUBLIC_SUPABASE_ANON_KEY   -> Supabase anon(publishable) key
//   VITE_PUBLIC_NAVER_CLIENT_ID     -> 네이버 개발자센터 앱 Client ID
//   VITE_PUBLIC_KAKAO_CLIENT_ID     -> 카카오 개발자센터 앱 JavaScript 키
//   VITE_SITE_URL                   -> 사이트 최종 배포 도메인 (예: https://example.com)
//
// 주의: VITE_PUBLIC_* 는 브라우저에 노출되는 공개 값만 넣는다.
// 절대 service_role 키나 비밀 키를 여기에 넣지 않는다.

function required(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    // 빌드/런타임에서 누락을 빠르게 인지할 수 있도록 명확히 알린다.
    throw new Error(`환경변수 ${name} 이(가) 설정되지 않았습니다. (.env.example 참고)`);
  }
  return value as string;
}

export const env = {
  supabaseUrl: required('VITE_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: required('VITE_PUBLIC_SUPABASE_ANON_KEY'),
  // 네이버 로그인은 선택 기능이므로 키가 없어도 사이트는 정상 동작한다.
  naverClientId: (import.meta.env.VITE_PUBLIC_NAVER_CLIENT_ID as string | undefined) ?? '',
  kakaoJsKey: (import.meta.env.VITE_PUBLIC_KAKAO_CLIENT_ID as string | undefined) ?? '',
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined || 'https://kingsix.kr').replace(/\/+$/, ''),
} as const;