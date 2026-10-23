import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FormEvent } from 'react';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!value) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!value.includes('@')) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await resetPassword(value);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-4 py-10 md:py-16">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
            <i className="ri-key-2-line text-2xl" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground-950">
            비밀번호 찾기
          </h1>
          <p className="mt-2 text-sm text-foreground-600">
            가입하신 이메일을 입력하면 재설정 링크를 보내드려요.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-background-200 bg-background-50 p-6">
          {sent ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <i className="ri-mail-send-line text-2xl" />
              </span>
              <h2 className="mt-4 font-heading text-lg font-bold text-foreground-950">
                재설정 메일을 보냈어요
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground-600">
                <span className="font-medium text-foreground-800">{email.trim()}</span> 로
                비밀번호 재설정 링크를 보냈어요. 링크를 눌러 새 비밀번호를 설정해주세요. (메일이 안
                보이면 스팸함도 확인해보세요.)
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-5 w-full whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
              >
                다른 이메일로 다시 보내기
              </button>
              <Link
                to="/auth"
                className="mt-2 block w-full whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-center text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-sm font-medium text-foreground-800"
                >
                  이메일
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                />
              </div>

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
                    보내는 중...
                  </>
                ) : (
                  '재설정 링크 보내기'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-foreground-500">
          비밀번호가 생각났다면{' '}
          <Link to="/auth" className="font-medium text-primary-700 hover:underline cursor-pointer">
            로그인
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}