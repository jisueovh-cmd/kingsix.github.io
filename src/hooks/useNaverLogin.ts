import { useCallback, useEffect, useRef } from 'react';
import { env } from '@/lib/env';

interface NaverLoginConfig {
  clientId: string;
  callbackUrl: string;
  isPopup: boolean;
  loginButton: { color: string; type: number; height: number };
}

interface NaverLoginInstance {
  init: () => void;
  getLoginStatus: (callback: (status: boolean) => void) => void;
  getAccessToken: () => string;
}

interface NaverSDK {
  LoginWithNaverId: new (config: NaverLoginConfig) => NaverLoginInstance;
}

declare global {
  interface Window {
    naver: NaverSDK;
    __naverLogin?: NaverLoginInstance;
  }
}

function getCallbackUrl(): string {
  // 네이버 개발자 센터에 등록된 콜백 URL과 정확히 일치해야 한다.
  // 미리보기 환경에서 window.location.origin이 미리보기 주소로 바뀌면
  // "서비스 설정에 오류가 있어" 에러가 나므로, 항상 배포 도메인을 기준으로 한다.
  const siteUrl = env.siteUrl;
  const base = siteUrl || window.location.origin;
  const basePath = __BASE_PATH__.split('/').filter(Boolean).join('/');
  const pathPrefix = basePath ? `/${basePath}` : '';
  return `${base}${pathPrefix}/auth`;
}

/**
 * 네이버 콜백으로 돌아왔을 때 URL 해시에 담긴 액세스 토큰을 동기적으로 캡처한다.
 *
 * 핵심: React의 useEffect는 브라우저 페인트 이후(마이크로태스크 이후)에 실행되므로,
 * 그 전에 Supabase의 detectSessionInUrl이 비동기 초기화 과정에서 해시를 먼저
 * 소비해버리면 네이버 토큰을 못 읽게 된다.
 *
 * 그래서 모듈 로딩 시점(완전 동기)에 토큰을 꺼내 보관하고, 해시를 즉시 제거해서
 * Supabase가 네이버 토큰을 Supabase 세션으로 오인하지 않도록 한다.
 */
function captureNaverToken(): string | null {
  if (typeof window === 'undefined') return null;
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!rawHash) return null;
  const params = new URLSearchParams(rawHash);
  const token = params.get('access_token');
  // Supabase JWT는 'eyJ'로 시작하므로 네이버 토큰과 구분한다.
  if (!token || token.startsWith('eyJ')) return null;
  // 해시를 즉시 제거: 새로고침 시 재처리 방지 + Supabase의 해시 오인 방지
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return token;
}

// 주의: 이 값은 네이버에서 '막 돌아온 순간' 딱 한 번만 소비되어야 한다.
// 한 번 쓰고 비우지 않으면, 로그아웃 후 로그인 화면에 다시 들어올 때마다
// 예전 토큰으로 자동 로그인돼 사용자가 계정을 선택할 수 없게 된다.
let capturedNaverToken = captureNaverToken();

/**
 * 네이버 로그인 JS SDK를 초기화하고,
 * 콜백으로 돌아왔을 때 액세스 토큰을 꺼내 onToken으로 전달한다.
 */
export function useNaverLogin(onToken: (accessToken: string) => void) {
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    // 1) 모듈 로딩 시점에 캡처한 네이버 토큰이 있으면(= 네이버에서 막 돌아온 경우)
    //    딱 한 번만 세션 처리로 넘기고, 캡처 값은 즉시 비운다.
    if (capturedNaverToken) {
      const token = capturedNaverToken;
      capturedNaverToken = null;
      onTokenRef.current(token);
      return;
    }

    if (!window.naver) return;
    const clientId = env.naverClientId;
    if (!clientId) return;

    const naverLogin = new window.naver.LoginWithNaverId({
      clientId,
      callbackUrl: getCallbackUrl(),
      isPopup: false,
      loginButton: { color: 'green', type: 3, height: 48 },
    });
    naverLogin.init();
    window.__naverLogin = naverLogin;

    // 2) 주의: 여기서 getLoginStatus로 자동 로그인을 시도하면 안 된다.
    //    그러면 로그아웃 후 로그인 화면에 들어오자마자 이전 계정으로 다시 로그인돼
    //    사용자가 계정을 선택할 수 없게 된다.
    //    로그인은 반드시 사용자가 버튼을 눌렀을 때만 시작한다.
  }, []);

  const startNaverLogin = useCallback(() => {
    // SDK가 렌더링한 버튼(#naverIdLogin 내부 <a>)을 클릭해 로그인 시작
    const sdkAnchor = document.querySelector('#naverIdLogin a') as HTMLElement | null;
    if (window.__naverLogin && sdkAnchor) {
      sdkAnchor.click();
      return;
    }

    // SDK 버튼을 못 찾으면 수동으로 네이버 인가 URL로 이동
    const clientId = env.naverClientId;
    if (!clientId) return;
    const state = Math.random().toString(36).slice(2, 12);
    window.location.href =
      'https://nid.naver.com/oauth2.0/authorize?response_type=token' +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(getCallbackUrl())}` +
      `&state=${state}`;
  }, []);

  return { startNaverLogin };
}