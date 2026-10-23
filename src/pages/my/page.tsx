import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import UserAvatar from '@/components/feature/UserAvatar';
import AvatarUploader from '@/pages/my/components/AvatarUploader';
import MyPostsSection, { type MyTab } from '@/pages/my/components/MyPostsSection';
import { useAuth } from '@/hooks/useAuth';
import { useMyStats } from '@/hooks/useMyStats';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const { postCount, savedCount, level, levelTier } = useMyStats(user?.id);
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<MyTab>('written');
  const postsRef = useRef<HTMLDivElement>(null);

  const openTab = (tab: MyTab) => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      postsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname ?? '');
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
      setUsername(profile.username ?? '');
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  const levelIcon =
    levelTier === 'master' ? 'ri-vip-crown-line' : levelTier === 'active' ? 'ri-fire-line' : 'ri-seedling-line';
  const isAdmin = useIsAdmin();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background-50">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[640px] flex-1 items-center justify-center px-4">
          <p className="text-sm text-foreground-500">불러오는 중...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background-50">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
            <i className="ri-lock-line text-2xl" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold text-foreground-950">
            로그인이 필요해요
          </h1>
          <p className="mt-2 text-sm text-foreground-600">
            내 정보를 보려면 먼저 로그인해주세요.
          </p>
          <Link
            to="/auth"
            className="mt-6 whitespace-nowrap rounded-md bg-primary-500 px-6 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
          >
            로그인하기
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (!/^[a-zA-Z0-9가-힣_]{3,20}$/.test(trimmedUsername)) {
      setError('아이디는 3~20자의 한글·영문·숫자·밑줄(_)만 사용할 수 있어요.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({ username: trimmedUsername, nickname, name, phone });
      if (res.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarChange = async (url: string | null) => {
    setError(null);
    setSaved(false);
    setAvatarUrl(url);
    const res = await updateProfile({ avatar_url: url });
    if (res.error) {
      setError(res.error);
      return;
    }
    setSaved(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[640px] flex-1 px-4 py-8 md:px-6">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
          <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
            홈
          </Link>
          <i className="ri-arrow-right-s-line" />
          <span className="text-foreground-800">내 정보</span>
        </nav>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => openTab('written')}
            aria-pressed={activeTab === 'written'}
            className={`rounded-lg border bg-background-50 p-4 text-center transition-colors cursor-pointer ${
              activeTab === 'written'
                ? 'border-primary-400 bg-primary-50/50'
                : 'border-background-200 hover:border-primary-300 hover:bg-background-100/40'
            }`}
          >
            <p className="font-heading text-2xl font-bold text-foreground-950">{postCount}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-foreground-500">
              <i className="ri-quill-pen-line text-sm" />
              작성한 글
            </p>
          </button>
          <button
            type="button"
            onClick={() => openTab('saved')}
            aria-pressed={activeTab === 'saved'}
            className={`rounded-lg border bg-background-50 p-4 text-center transition-colors cursor-pointer ${
              activeTab === 'saved'
                ? 'border-primary-400 bg-primary-50/50'
                : 'border-background-200 hover:border-primary-300 hover:bg-background-100/40'
            }`}
          >
            <p className="font-heading text-2xl font-bold text-foreground-950">{savedCount}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-foreground-500">
              <i className="ri-bookmark-line text-sm" />
              저장한 글
            </p>
          </button>
          <div className="rounded-lg border border-background-200 bg-background-50 p-4 text-center">
            <p className="flex items-center justify-center text-accent-600">
              <i className={`${levelIcon} text-xl`} />
            </p>
            <p className="mt-1 truncate text-xs font-medium text-foreground-700">{level}</p>
            <p className="text-[10px] text-foreground-400">활동 레벨</p>
          </div>
        </div>

        <section className="rounded-lg border border-background-200 bg-background-50 p-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              src={profile?.avatar_url}
              name={profile?.nickname || profile?.username || '회원'}
              sizeClass="h-16 w-16"
            />
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 font-heading text-xl font-bold text-foreground-950">
                <span>{profile?.nickname || profile?.username || profile?.name || '회원'}</span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-background-50">
                    <i className="ri-shield-star-line text-xs" />
                    관리자
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-800">
                  <i className={`${levelIcon} text-xs`} />
                  {level}
                </span>
              </h1>
              <p className="mt-1 truncate text-sm text-foreground-500">
                {profile?.username ? `아이디 · ${profile.username}` : user.email}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-background-200 bg-background-100/60 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-foreground-800">
              <i className="ri-image-circle-line text-base text-accent-700" />
              프로필 사진
            </p>
            <AvatarUploader
              userId={user.id}
              currentUrl={avatarUrl}
              onChange={handleAvatarChange}
            />
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="my-username"
                className="block text-sm font-medium text-foreground-800"
              >
                아이디
              </label>
              <input
                id="my-username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                placeholder="로그인에 사용할 아이디"
                autoComplete="username"
                className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
              />
              <p className="mt-1.5 text-xs text-foreground-500">
                로그인할 때 쓰는 아이디예요. 한글·영문·숫자·밑줄(_)만 가능하고, 다른 사람과 겹칠 수 없어요.
              </p>
            </div>

            <div>
              <label
                htmlFor="my-nickname"
                className="block text-sm font-medium text-foreground-800"
              >
                닉네임
              </label>
              <input
                id="my-nickname"
                name="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
                placeholder="커뮤니티에 표시될 닉네임"
                className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
              />
            </div>

            <div>
              <label htmlFor="my-name" className="block text-sm font-medium text-foreground-800">
                이름
              </label>
              <input
                id="my-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="실명"
                className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
              />
            </div>

            <div>
              <label htmlFor="my-phone" className="block text-sm font-medium text-foreground-800">
                전화번호
              </label>
              <input
                id="my-phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="010-0000-0000"
                className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-800">이메일</label>
              <input
                type="email"
                value={user.email ?? ''}
                disabled
                className="mt-1.5 w-full rounded-md border border-background-200 bg-background-100 px-3 py-2.5 text-sm text-foreground-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
                <i className="ri-error-warning-line text-base" />
                {error}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 rounded-md border border-accent-200 bg-accent-50 px-3 py-2.5 text-xs text-accent-800">
                <i className="ri-checkbox-circle-line text-base" />
                정보가 저장됐어요.
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {saving ? '저장 중...' : '저장하기'}
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-medium text-foreground-700 transition-colors hover:bg-background-100 cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </form>
        </section>

        <div className="mt-6" ref={postsRef}>
          <MyPostsSection userId={user.id} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}