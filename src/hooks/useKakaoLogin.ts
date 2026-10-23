import { useCallback, useEffect, useRef } from 'react';
import { env } from '@/lib/env';

interface KakaoAuthObject {
  access_token: string;
}

interface KakaoSdk {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Auth: {
    login: (options: {
      scope?: string;
      success: (authObj: KakaoAuthObject) => void;
      fail: (error: unknown) => void;
    }) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

// 카카오 자바스크립트 SDK. 최신 버전을 우선 시도하고, 실패하면 대체 주소로 넘어간다.
const KAKAO_SDK_URLS = [
  'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js',
  'https://developers.kakao.com/sdk/js/kakao.min.js',
];

let sdkPromise: Promise<KakaoSdk | null> | null = null;

function loadKakaoSdk(): Promise<KakaoSdk | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.Kakao) return Promise.resolve(window.Kakao);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve) => {
    let index = 0;
    const tryNext = () => {
      if (index >= KAKAO_SDK_URLS.length) {
        resolve(null);
        return;
      }
      const src = KAKAO_SDK_URLS[index];
      index += 1;
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        if (window.Kakao) resolve(window.Kakao);
        else tryNext();
      };
      script.onerror = () => tryNext();
      document.head.appendChild(script);
    };
    tryNext();
  });
  return sdkPromise;
}

/**
 * 카카오 로그인 JS SDK를 초기화하고, 로그인이 끝나면 액세스 토큰을 돌려준다.
 * 네이버와 같은 방식으로, 카카오도 Supabase 기본 OAuth를 거치지 않는다.
 * (Supabase 기본 OAuth는 같은 이메일이면 홈페이지 계정과 자동으로 합쳐져 버린다.)
 */
export function useKakaoLogin(onError: (message: string) => void) {
  const errorRef = useRef(onError);
  errorRef.current = onError;

  useEffect(() => {
    const key = env.kakaoJsKey;
    if (!key) return;
    loadKakaoSdk().then((kakao) => {
      if (kakao && !kakao.isInitialized()) {
        try {
          kakao.init(key);
        } catch {
          // 초기화 실패는 로그인 시점에 다시 시도한다.
        }
      }
    });
  }, []);

  const startKakaoLogin = useCallback((onToken: (accessToken: string) => void) => {
    const key = env.kakaoJsKey;
    if (!key) {
      errorRef.current('카카오 로그인 설정이 필요해요.');
      return;
    }
    loadKakaoSdk().then((kakao) => {
      if (!kakao) {
        errorRef.current('카카오 로그인 도구를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
        return;
      }
      if (!kakao.isInitialized()) {
        try {
          kakao.init(key);
        } catch {
          errorRef.current('카카오 로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.');
          return;
        }
      }
      kakao.Auth.login({
        success: (authObj) => {
          if (authObj?.access_token) {
            onToken(authObj.access_token);
          } else {
            errorRef.current('카카오 인증 토큰을 받지 못했어요.');
          }
        },
        fail: () => errorRef.current('카카오 로그인이 취소되었거나 실패했어요.'),
      });
    });
  }, []);

  return { startKakaoLogin };
}