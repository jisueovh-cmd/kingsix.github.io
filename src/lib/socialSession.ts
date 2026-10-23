import { env } from '@/lib/env';

// 로그아웃할 때 카카오·네이버 같은 소셜 로그인 세션도 함께 정리하는 헬퍼.
//
// 왜 필요한가:
// Supabase에서 로그아웃해도 카카오/네이버에 남아 있는 세션은 그대로 유지된다.
// 그래서 다시 로그인하면 계정 선택 화면 없이 이전 계정으로 자동 로그인돼 버린다.
// 여기서 소셜 세션을 같이 지워주면, 다음 로그인 때 계정 선택/로그인 화면이 정상적으로 뜬다.

interface KakaoSdk {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Auth?: {
    logout?: (callback?: () => void) => void;
  };
}

const KAKAO_SDK_URLS = [
  'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js',
  'https://developers.kakao.com/sdk/js/kakao.min.js',
];

function loadKakaoSdk(): Promise<KakaoSdk | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const w = window as unknown as { Kakao?: KakaoSdk };
  if (w.Kakao) return Promise.resolve(w.Kakao);

  return new Promise((resolve) => {
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
        if (w.Kakao) resolve(w.Kakao);
        else tryNext();
      };
      script.onerror = () => tryNext();
      document.head.appendChild(script);
    };
    tryNext();
  });
}

/** 카카오 SDK 세션을 정리한다. 실패해도 무시한다. */
async function logoutKakao(): Promise<void> {
  const key = env.kakaoJsKey;
  if (!key) return;
  const kakao = await loadKakaoSdk();
  if (!kakao) return;
  try {
    if (!kakao.isInitialized()) kakao.init(key);
    kakao.Auth?.logout?.();
  } catch {
    // 카카오 세션 정리 실패는 무시한다.
  }
}

/** 네이버 SDK 세션을 정리한다. 실패해도 무시한다. */
function logoutNaver(): void {
  try {
    const naver = (window as unknown as { __naverLogin?: { logout?: () => void } })
      .__naverLogin;
    naver?.logout?.();
  } catch {
    // 네이버 세션 정리 실패는 무시한다.
  }
}

/**
 * 로그아웃 시 카카오·네이버 소셜 세션을 함께 정리한다.
 * 이렇게 해야 다음 로그인 때 이전 계정으로 자동 로그인되지 않고
 * 계정 선택/로그인 화면이 정상적으로 뜬다.
 */
export async function logoutSocialSessions(): Promise<void> {
  logoutNaver();
  await logoutKakao();
}