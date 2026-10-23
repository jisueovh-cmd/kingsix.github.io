import { useState } from 'react';
import type { OAuthDiagnosis } from '@/lib/oauthError';

interface SocialLoginButtonsProps {
  onDiagnosis: (diagnosis: OAuthDiagnosis | null) => void;
  onNaverLogin: () => void;
  onKakaoLogin: () => void;
}

export default function SocialLoginButtons({
  onDiagnosis,
  onNaverLogin,
  onKakaoLogin,
}: SocialLoginButtonsProps) {
  const [pending, setPending] = useState<'kakao' | 'naver' | null>(null);

  // 카카오 로그인은 팝업으로 진행되고 결과는 콜백으로 처리된다.
  // 버튼이 멈춘 것처럼 보이지 않도록 잠시 뒤 다시 활성화한다.
  const withPending = (channel: 'kakao' | 'naver', run: () => void) => {
    if (pending) return;
    onDiagnosis(null);
    setPending(channel);
    run();
    window.setTimeout(() => setPending(null), 1500);
  };

  return (
    <div className="space-y-2.5">
      {/* 네이버 JS SDK가 로그인 버튼을 렌더링하는 숨김 컨테이너 */}
      <div id="naverIdLogin" className="hidden" />

      <button
        type="button"
        onClick={() => withPending('kakao', onKakaoLogin)}
        disabled={pending !== null}
        className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#FEE500] px-4 py-2.5 text-sm font-semibold text-[#191919] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-5 w-5 items-center justify-center">
          <i className="ri-kakao-talk-fill text-lg" />
        </span>
        {pending === 'kakao' ? '카카오 연결 중...' : '카카오로 시작하기'}
      </button>

      <button
        type="button"
        onClick={() => withPending('naver', onNaverLogin)}
        disabled={pending !== null}
        className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#03C75A] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-5 w-5 items-center justify-center">
          <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-white/15 font-heading text-[13px] font-bold leading-none">
            N
          </span>
        </span>
        네이버로 시작하기
      </button>
    </div>
  );
}