import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import PasswordInput from '@/pages/auth/components/PasswordInput';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, signOut } = useAuth();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && mounted) {
        setReady(true);
        setChecking(false);
      }
    });

    // 이벤트가 컴포넌트 마운트보다 먼저 처리된 경우를 대비해 세션을 직접 확인한다.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) setReady(true);
      setChecking(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await updatePassword(password);
      if (res.error) {
        setError(res.error);
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoLogin = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-4 py-10 md:py-16">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
            <i className="ri-shield-keyhole-line text-2xl" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground-950">
            새 비밀번호 설정
          </h1>
          <p className="mt-2 text-sm text-foreground-600">
            앞으로 사용할 새 비밀번호를 입력해주세요.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-background-200 bg-background-50 p-6">
          {checking ? (
            <div className="flex flex-col items-center py-10 text-center">
              <i className="ri-loader-4-line animate-spin text-2xl text-foreground-400" />
              <p className="mt-3 text-sm text-foreground-600">링크를 확인하고 있어요...</p>
            </div>
          ) : done ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <i className="ri-check-line text-2xl" />
              </span>
              <h2 className="mt-4 font-heading text-lg font-bold text-foreground-950">
                비밀번호가 변경됐어요
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground-600">
                이제 새 비밀번호로 로그인할 수 있어요.
              </p>
              <button
                type="button"
                onClick={handleGoLogin}
                className="mt-5 w-full whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                로그인하러 가기
              </button>
            </div>
          ) : ready ? (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <PasswordInput
                id="reset-password"
                name="password"
                label="새 비밀번호"
                value={password}
                onChange={setPassword}
                placeholder="6자 이상 입력하세요"
                autoComplete="new-password"
                showStrength
              />
              <PasswordInput
                id="reset-confirm"
                name="confirm"
                label="비밀번호 확인"
                value={confirm}
                onChange={setConfirm}
                placeholder="한 번 더 입력하세요"
                autoComplete="new-password"
              />

              {error && (
                <div className="flex items-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
                  <i className="ri-error-warning-line text-base" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin" />
                    변경 중...
                  </>
                ) : (
                  '비밀번호 변경'
                )}
              </button>
            </form>
          ) : (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <i className="ri-error-warning-line text-2xl" />
              </span>
              <h2 className="mt-4 font-heading text-lg font-bold text-foreground-950">
                링크가 유효하지 않아요
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground-600">
                재설정 링크가 만료됐거나 이미 사용됐을 수 있어요. 다시 비밀번호 찾기를 진행해주세요.
              </p>
              <Link
                to="/auth/forgot-password"
                className="mt-5 block w-full whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-center text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                비밀번호 다시 찾기
              </Link>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}