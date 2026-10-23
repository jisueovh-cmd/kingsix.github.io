import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import SocialLoginButtons from '@/pages/auth/components/SocialLoginButtons';
import OAuthErrorNotice from '@/pages/auth/components/OAuthErrorNotice';
import PasswordInput from '@/pages/auth/components/PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { useNaverLogin } from '@/hooks/useNaverLogin';
import { useKakaoLogin } from '@/hooks/useKakaoLogin';
import { useToast } from '@/components/feature/ToastProvider';
import { diagnoseOAuthError } from '@/lib/oauthError';
import type { OAuthDiagnosis } from '@/lib/oauthError';

type Mode = 'login' | 'signup';
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const USERNAME_PATTERN = /^[a-zA-Z0-9가-힣_]{3,20}$/;

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp, resendConfirmation, checkUsername, completeNaverLogin, completeKakaoLogin } =
    useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState<string | null>(null);
  const [oauthIssue, setOauthIssue] = useState<OAuthDiagnosis | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [naverHandling, setNaverHandling] = useState(false);
  const [naverError, setNaverError] = useState<string | null>(null);
  const naverHandlingRef = useRef(false);
  const [kakaoHandling, setKakaoHandling] = useState(false);
  const [kakaoError, setKakaoError] = useState<string | null>(null);
  const kakaoHandlingRef = useRef(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setOauthIssue(null);
    setNeedsConfirm(false);
    setNeedsEmailConfirm(false);
    setPendingEmail('');
    setResendMessage(null);
    setUsername('');
    setUsernameStatus('idle');
    setPassword('');
    setAgreed(false);
    setNaverError(null);
    setKakaoError(null);
  };

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    const rawHash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(rawHash || window.location.search);
    const oauthError = params.get('error_description') || params.get('error');
    if (oauthError) {
      setOauthIssue(diagnoseOAuthError('', oauthError));
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // 네이버 로그인 콜백: 액세스 토큰을 받아 세션 완료 처리
  const handleNaverToken = useCallback(
    async (accessToken: string) => {
      if (naverHandlingRef.current) return;
      naverHandlingRef.current = true;
      setNaverHandling(true);
      // URL의 #access_token 제거 (새로고침 시 재처리 방지)
      window.history.replaceState(null, '', window.location.pathname);
      const res = await completeNaverLogin(accessToken);
      setNaverHandling(false);
      if (res.error) {
        setNaverError(res.error);
        setOauthIssue(null);
        toast(res.error, 'error');
      }
    },
    [completeNaverLogin, toast],
  );

  // 로그인이 오래 걸리면 네트워크 지연 안내를 띄운다.
  useEffect(() => {
    if (!naverHandling) return;
    const timer = setTimeout(() => {
      toast('로그인 처리가 지연되고 있어요. 잠시만 기다려주세요.', 'info');
    }, 8000);
    return () => clearTimeout(timer);
  }, [naverHandling, toast]);

  const { startNaverLogin } = useNaverLogin(handleNaverToken);

  // 카카오 로그인 콜백: 액세스 토큰을 받아 세션 완료 처리
  const handleKakaoToken = useCallback(
    async (accessToken: string) => {
      if (kakaoHandlingRef.current) return;
      kakaoHandlingRef.current = true;
      setKakaoHandling(true);
      const res = await completeKakaoLogin(accessToken);
      setKakaoHandling(false);
      if (res.error) {
        setKakaoError(res.error);
        toast(res.error, 'error');
      }
    },
    [completeKakaoLogin, toast],
  );

  const { startKakaoLogin } = useKakaoLogin((message) => {
    setKakaoError(message);
    toast(message, 'error');
  });

  const handleKakaoLogin = useCallback(() => {
    setKakaoError(null);
    startKakaoLogin(handleKakaoToken);
  }, [startKakaoLogin, handleKakaoToken]);

  // 아이디 실시간 중복 검사 (디바운스)
  useEffect(() => {
    if (mode !== 'signup') return;
    const value = username.trim();
    if (!value) {
      setUsernameStatus('idle');
      return;
    }
    if (!USERNAME_PATTERN.test(value)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const taken = await checkUsername(value);
      setUsernameStatus(taken ? 'taken' : 'available');
    }, 400);
    return () => clearTimeout(timer);
  }, [username, mode, checkUsername]);

  const handleResend = async () => {
    if (!pendingEmail || resending) return;
    setResending(true);
    setResendMessage(null);
    const res = await resendConfirmation(pendingEmail);
    setResending(false);
    if (res.error) {
      setResendMessage(res.error);
    } else {
      setResendMessage('인증 메일을 다시 보냈어요. 메일함(스팸함 포함)을 확인해주세요.');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResendMessage(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      if (mode === 'login') {
        const identifier = String(data.get('identifier') ?? '');
        if (!identifier.trim() || !password) {
          setError('아이디와 비밀번호를 입력해주세요.');
          return;
        }
        const res = await signIn(identifier, password);
        if (res.error) {
          setError(res.error);
          if (res.needsEmailConfirm) {
            setNeedsEmailConfirm(true);
            setPendingEmail(res.email ?? '');
          }
          return;
        }
        navigate('/');
      } else {
        const email = String(data.get('email') ?? '').trim();
        const name = String(data.get('name') ?? '').trim();
        const phone = String(data.get('phone') ?? '').trim();
        const nickname = String(data.get('nickname') ?? '').trim();
        const uname = username.trim();

        if (!uname || !email || !password) {
          setError('아이디, 이메일, 비밀번호는 필수입니다.');
          return;
        }
        if (!USERNAME_PATTERN.test(uname)) {
          setError('아이디는 3~20자의 영문·숫자·한글·밑줄(_)만 사용할 수 있어요.');
          return;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          setError('올바른 이메일 주소를 입력해주세요.');
          return;
        }
        if (password.length < 6) {
          setError('비밀번호는 6자 이상이어야 합니다.');
          return;
        }
        if (!agreed) {
          setError('서비스 이용약관과 개인정보 처리방침에 동의해주세요.');
          return;
        }
        const taken = await checkUsername(uname);
        if (taken) {
          setUsernameStatus('taken');
          setError('이미 사용 중인 아이디예요. 다른 아이디를 입력해주세요.');
          return;
        }

        const res = await signUp({ username: uname, email, password, name, phone, nickname });
        if (res.error) {
          setError(res.error);
          return;
        }
        if (res.needsConfirm) {
          setNeedsConfirm(true);
          setPendingEmail(email);
          return;
        }
        navigate('/');
      }
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
            <i className="ri-plant-line text-2xl" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground-950">
            {mode === 'login' ? '다시 만나서 반가워요' : '아지트에 오신 걸 환영해요'}
          </h1>
          <p className="mt-2 text-sm text-foreground-600">
            {mode === 'login'
              ? '아이디 또는 이메일로 로그인해주세요.'
              : '회원가입 후 닉네임을 설정하고 취미를 기록해보세요.'}
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-background-200 bg-background-50 p-6">
          {needsConfirm ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <i className="ri-mail-send-line text-2xl" />
              </span>
              <h2 className="mt-4 font-heading text-lg font-bold text-foreground-950">
                이메일 인증이 필요해요
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground-600">
                <span className="font-medium text-foreground-800">{pendingEmail}</span> 로 인증
                메일을 보냈어요. 메일의 링크를 눌러 인증을 완료하면 로그인할 수 있어요.
              </p>

              {resendMessage && (
                <p className="mt-3 text-xs text-foreground-600">{resendMessage}</p>
              )}

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="mt-5 w-full whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {resending ? '보내는 중...' : '인증 메일 다시 받기'}
              </button>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="mt-2 w-full whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                로그인으로 돌아가기
              </button>
            </div>
          ) : (
            <>
              <div className="flex rounded-full bg-background-100 p-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'bg-background-50 text-foreground-950 shadow-sm'
                      : 'text-foreground-600 hover:text-foreground-800'
                  }`}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-background-50 text-foreground-950 shadow-sm'
                      : 'text-foreground-600 hover:text-foreground-800'
                  }`}
                >
                  회원가입
                </button>
              </div>

              <div className="mt-6">
                <SocialLoginButtons
                  onDiagnosis={setOauthIssue}
                  onNaverLogin={startNaverLogin}
                  onKakaoLogin={handleKakaoLogin}
                />
                {naverHandling && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-foreground-600">
                    <i className="ri-loader-4-line animate-spin" />
                    네이버 로그인을 처리하고 있어요...
                  </div>
                )}
                {naverError && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
                    <i className="ri-error-warning-line mt-0.5 text-base" />
                    <span className="leading-relaxed">{naverError}</span>
                  </div>
                )}
                {kakaoHandling && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-foreground-600">
                    <i className="ri-loader-4-line animate-spin" />
                    카카오 로그인을 처리하고 있어요...
                  </div>
                )}
                {kakaoError && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
                    <i className="ri-error-warning-line mt-0.5 text-base" />
                    <span className="leading-relaxed">{kakaoError}</span>
                  </div>
                )}
                {oauthIssue && (
                  <div className="mt-3">
                    <OAuthErrorNotice
                      diagnosis={oauthIssue}
                      onClose={() => setOauthIssue(null)}
                    />
                  </div>
                )}
              </div>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-background-200" />
                <span className="whitespace-nowrap text-xs text-foreground-500">또는 아이디로</span>
                <span className="h-px flex-1 bg-background-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {mode === 'login' ? (
                  <>
                    <Field
                      name="identifier"
                      type="text"
                      label="아이디 또는 이메일"
                      placeholder="아이디나 이메일을 입력하세요"
                      autoComplete="username"
                    />
                    <PasswordInput
                      id="auth-password"
                      name="password"
                      label="비밀번호"
                      value={password}
                      onChange={setPassword}
                      placeholder="비밀번호를 입력하세요"
                      autoComplete="current-password"
                    />
                    <div className="flex justify-end">
                      <Link
                        to="/auth/forgot-password"
                        className="whitespace-nowrap text-xs text-foreground-500 transition-colors hover:text-primary-700 cursor-pointer"
                      >
                        비밀번호를 잊으셨나요?
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor="auth-username"
                        className="block text-sm font-medium text-foreground-800"
                      >
                        아이디
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          id="auth-username"
                          name="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="사용할 아이디를 입력하세요"
                          autoComplete="username"
                          className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 pr-9 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                        />
                        {usernameStatus === 'checking' && (
                          <span className="pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center">
                            <i className="ri-loader-4-line animate-spin text-foreground-400" />
                          </span>
                        )}
                        {usernameStatus === 'available' && (
                          <span className="pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-accent-600">
                            <i className="ri-check-line" />
                          </span>
                        )}
                        {usernameStatus === 'taken' && (
                          <span className="pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-primary-600">
                            <i className="ri-error-warning-line" />
                          </span>
                        )}
                      </div>
                      {usernameStatus === 'available' && (
                        <p className="mt-1 text-xs text-accent-700">사용 가능한 아이디예요.</p>
                      )}
                      {usernameStatus === 'taken' && (
                        <p className="mt-1 text-xs text-primary-700">
                          이미 사용 중인 아이디예요.
                        </p>
                      )}
                      {usernameStatus === 'invalid' && (
                        <p className="mt-1 text-xs text-primary-700">
                          3~20자의 영문·숫자·한글·밑줄(_)만 사용할 수 있어요.
                        </p>
                      )}
                    </div>
                    <Field
                      name="email"
                      type="email"
                      label="이메일"
                      placeholder="example@email.com"
                      autoComplete="email"
                    />
                    <PasswordInput
                      id="auth-password"
                      name="password"
                      label="비밀번호"
                      value={password}
                      onChange={setPassword}
                      placeholder="6자 이상 입력하세요"
                      autoComplete="new-password"
                      showStrength
                    />
                    <Field
                      name="nickname"
                      type="text"
                      label="닉네임 (선택)"
                      placeholder="사이트에서 보여질 이름"
                      autoComplete="nickname"
                    />
                    <Field
                      name="name"
                      type="text"
                      label="이름"
                      placeholder="실명을 입력하세요"
                      autoComplete="name"
                    />
                    <Field
                      name="phone"
                      type="tel"
                      label="전화번호"
                      placeholder="010-0000-0000"
                      autoComplete="tel"
                    />
                  </>
                )}

                {needsEmailConfirm && (
                  <div className="rounded-md border border-accent-200 bg-accent-50 p-3.5">
                    <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground-700">
                      <i className="ri-mail-check-line mt-0.5 text-base text-accent-600" />
                      <span>
                        가입하신 이메일 인증이 아직 안 됐어요. 인증 메일을 다시 받아 완료해주세요.
                      </span>
                    </p>
                    {resendMessage && (
                      <p className="mt-2 text-xs text-foreground-600">{resendMessage}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="mt-2.5 whitespace-nowrap rounded-md bg-accent-500 px-3 py-1.5 text-xs font-medium text-background-50 transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      {resending ? '보내는 중...' : '인증 메일 다시 받기'}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
                    <i className="ri-error-warning-line text-base" />
                    {error}
                  </div>
                )}

                {mode === 'signup' && (
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 cursor-pointer rounded border-background-300 accent-primary-500"
                    />
                    <span className="text-xs leading-relaxed text-foreground-600">
                      <span className="font-medium text-foreground-800">서비스 이용약관</span>과{' '}
                      <span className="font-medium text-foreground-800">개인정보 처리방침</span>에
                      동의합니다.
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={submitting || usernameStatus === 'checking'}
                  className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin" />
                      처리 중...
                    </>
                  ) : mode === 'login' ? (
                    '로그인'
                  ) : (
                    '가입하기'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-foreground-500">
          회원가입 없이도{' '}
          <Link to="/write" className="font-medium text-primary-700 hover:underline cursor-pointer">
            글쓰기
          </Link>
          와 댓글은 자유롭게 이용할 수 있어요.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({
  name,
  type,
  label,
  placeholder,
  autoComplete,
}: {
  name: string;
  type: string;
  label: string;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={`auth-${name}`}
        className="block text-sm font-medium text-foreground-800"
      >
        {label}
      </label>
      <input
        id={`auth-${name}`}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
      />
    </div>
  );
}