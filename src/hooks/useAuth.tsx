import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Provider, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/home';
import { diagnoseOAuthError } from '@/lib/oauthError';
import type { OAuthDiagnosis } from '@/lib/oauthError';
import { logoutSocialSessions } from '@/lib/socialSession';

interface SignUpInput {
  username: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  nickname: string;
}

interface UpdateProfileInput {
  username?: string;
  nickname?: string;
  name?: string;
  phone?: string;
  avatar_url?: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: string | null; needsEmailConfirm: boolean; email: string | null }>;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsConfirm: boolean }>;
  signInWithOAuth: (provider: string) => Promise<{ diagnosis: OAuthDiagnosis | null }>;
  completeNaverLogin: (accessToken: string) => Promise<{ error: string | null }>;
  completeKakaoLogin: (accessToken: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  checkUsername: (username: string) => Promise<boolean>;
  updateProfile: (input: UpdateProfileInput) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, nickname, name, phone, avatar_url, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) return null;
  return (data as Profile) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).then((p) => {
          if (active) setProfile(p);
        });
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        fetchProfile(nextUser.id).then((p) => {
          if (active) setProfile(p);
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user]);

  const signIn = useCallback(
    async (
      identifier: string,
      password: string,
    ): Promise<{ error: string | null; needsEmailConfirm: boolean; email: string | null }> => {
      const trimmed = identifier.trim();
      let email = trimmed;
      if (!trimmed.includes('@')) {
        const { data, error } = await supabase.rpc('get_email_by_username', {
          p_username: trimmed,
        });
        if (error) return { error: '아이디를 확인해주세요.', needsEmailConfirm: false, email: null };
        if (!data) return { error: '존재하지 않는 아이디입니다.', needsEmailConfirm: false, email: null };
        email = data as string;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
          return {
            error: '이메일 인증이 아직 완료되지 않았어요.',
            needsEmailConfirm: true,
            email,
          };
        }
        return {
          error: '아이디 또는 비밀번호가 올바르지 않습니다.',
          needsEmailConfirm: false,
          email: null,
        };
      }
      return { error: null, needsEmailConfirm: false, email: null };
    },
    [],
  );

  const signUp = useCallback(
    async (input: SignUpInput): Promise<{ error: string | null; needsConfirm: boolean }> => {
      const basePath = __BASE_PATH__.split('/').filter(Boolean).join('/');
      const pathPrefix = basePath ? `/${basePath}` : '';
      const emailRedirectTo = `${window.location.origin}${pathPrefix}/auth`;
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          emailRedirectTo,
          data: {
            username: input.username.trim(),
            nickname: input.nickname.trim(),
            name: input.name.trim(),
            phone: input.phone.trim(),
          },
        },
      });
      if (error) return { error: error.message, needsConfirm: false };
      const needsConfirm = !data.session;
      return { error: null, needsConfirm };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // 카카오·네이버 소셜 세션도 함께 정리한다.
    // 이래야 로그아웃 후 다시 로그인할 때 이전 계정으로 자동 로그인되지 않고
    // 계정 선택/로그인 화면이 정상적으로 뜼다.
    await logoutSocialSessions();
  }, []);

  const resendConfirmation = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const basePath = __BASE_PATH__.split('/').filter(Boolean).join('/');
      const pathPrefix = basePath ? `/${basePath}` : '';
      const emailRedirectTo = `${window.location.origin}${pathPrefix}/auth`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo },
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const basePath = __BASE_PATH__.split('/').filter(Boolean).join('/');
      const pathPrefix = basePath ? `/${basePath}` : '';
      const redirectTo = `${window.location.origin}${pathPrefix}/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  const checkUsername = useCallback(async (username: string): Promise<boolean> => {
    const trimmed = username.trim();
    if (!trimmed) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', trimmed)
      .maybeSingle();
    if (error) return false;
    return !!data;
  }, []);

  const signInWithOAuth = useCallback(
    async (provider: string): Promise<{ diagnosis: OAuthDiagnosis | null }> => {
      const basePath = __BASE_PATH__.split('/').filter(Boolean).join('/');
      const pathPrefix = basePath ? `/${basePath}` : '';
      const redirectTo = `${window.location.origin}${pathPrefix}/auth`;
      // 카카오는 Supabase 기본 프로바이더(kakao)로 연결한다.
      // 네이버는 Supabase를 거치지 않고 공식 JS SDK + naver-auth 엣지 함수로 처리한다.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: { redirectTo },
      });
      if (error) return { diagnosis: diagnoseOAuthError(provider, error.message) };
      return { diagnosis: null };
    },
    [],
  );

  const finishSocialLogin = useCallback(
    async (functionName: string, accessToken: string): Promise<{ error: string | null }> => {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { access_token: accessToken },
      });
      if (error) {
        // 엣지 함수가 non-2xx로 에러를 반환하면, 실제 원인 메시지를 꺼내서 보여준다.
        let serverMessage = '소셜 로그인 처리에 실패했어요. 잠시 후 다시 시도해주세요.';
        try {
          const ctx = (error as { context?: { json?: () => Promise<unknown> } }).context;
          if (ctx && typeof ctx.json === 'function') {
            const body = (await ctx.json()) as { error?: string } | null;
            if (body?.error) serverMessage = body.error;
          }
        } catch {
          // 본문 파싱 실패 시 기본 메시지 유지
        }
        return { error: serverMessage };
      }
      const payload = data as {
        error?: string;
        access_token?: string;
        refresh_token?: string;
      } | null;
      if (payload?.error) {
        return { error: payload.error };
      }
      if (!payload?.access_token || !payload?.refresh_token) {
        return { error: '로그인 세션을 만들지 못했어요.' };
      }
      const { error: setErr } = await supabase.auth.setSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
      });
      if (setErr) return { error: '로그인 세션 등록에 실패했어요.' };

      // 세션 저장 후 즉시 유저 상태를 갱신해서 우측 상단 UI가
      // '로그인'에서 '프로필/마이페이지/로그아웃'으로 바로 바뀌도록 한다.
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        const p = await fetchProfile(sessionUser.id);
        setProfile(p);
      } else {
        setProfile(null);
      }

      return { error: null };
    },
    [],
  );

  const completeNaverLogin = useCallback(
    (accessToken: string): Promise<{ error: string | null }> =>
      finishSocialLogin('naver-auth', accessToken),
    [finishSocialLogin],
  );

  const completeKakaoLogin = useCallback(
    (accessToken: string): Promise<{ error: string | null }> =>
      finishSocialLogin('kakao-auth', accessToken),
    [finishSocialLogin],
  );

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<{ error: string | null }> => {
      if (!user) return { error: '로그인이 필요합니다.' };
      const patch: Record<string, string | null> = {};
      if (input.username !== undefined) patch.username = input.username.trim();
      if (input.nickname !== undefined) patch.nickname = input.nickname.trim();
      if (input.name !== undefined) patch.name = input.name.trim();
      if (input.phone !== undefined) patch.phone = input.phone.trim();
      if (input.avatar_url !== undefined) patch.avatar_url = input.avatar_url;
      const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
      if (error) {
        if (error.code === '23505' && String(error.message).includes('username')) {
          return { error: '이미 사용 중인 아이디예요. 다른 아이디를 입력해주세요.' };
        }
        return { error: error.message };
      }
      await refreshProfile();
      return { error: null };
    },
    [user, refreshProfile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signUp,
      signInWithOAuth,
      completeNaverLogin,
      completeKakaoLogin,
      signOut,
      resendConfirmation,
      resetPassword,
      updatePassword,
      checkUsername,
      updateProfile,
      refreshProfile,
    }),
    [
      user,
      profile,
      loading,
      signIn,
      signUp,
      signInWithOAuth,
      completeNaverLogin,
      completeKakaoLogin,
      signOut,
      resendConfirmation,
      resetPassword,
      updatePassword,
      checkUsername,
      updateProfile,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}