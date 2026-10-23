import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_CATEGORIES, NAV_COMMUNITY, NAV_EXPLORE, NAV_AGE_GROUPS, SITE_NAME, type NavItem } from '@/lib/nav';
import SearchOverlay from '@/components/feature/SearchOverlay';
import NotificationBell from '@/components/feature/NotificationBell';
import UserAvatar from '@/components/feature/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const dropdowns: { key: string; label: string; items: NavItem[] }[] = [
    { key: 'explore', label: '탐색', items: NAV_EXPLORE },
    {
      key: 'region',
      label: '지역',
      items: [
        { label: '군포·수도권 지역 정보', to: '/region' },
        { label: '전국 지역 정보', to: '/nation' },
      ],
    },
    { key: 'category', label: '카테고리', items: NAV_CATEGORIES },
    { key: 'age', label: '연령대', items: NAV_AGE_GROUPS },
    { key: 'community', label: '커뮤니티', items: NAV_COMMUNITY },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
          scrolled
            ? 'bg-background-50/95 backdrop-blur border-b border-background-200'
            : 'bg-background-50 border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-[68px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 shrink-0 cursor-pointer">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-plant-line text-xl" />
            </span>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground-950">
              {SITE_NAME}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
            >
              홈
            </Link>

            {dropdowns.map((dd) => (
              <div
                key={dd.key}
                className="relative"
                onMouseEnter={() => setOpenDropdown(dd.key)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown((v) => (v === dd.key ? null : dd.key))}
                  className="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
                >
                  {dd.label}
                  <i className="ri-arrow-down-s-line text-base" />
                </button>
                {openDropdown === dd.key && (
                  <div className="absolute left-0 top-full w-52 pt-2">
                    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50 py-1">
                      {dd.items.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="block px-4 py-2.5 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/events"
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
            >
              이벤트
            </Link>

            <Link
              to="/about"
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
            >
              ABOUT
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="검색"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
            >
              <i className="ri-search-line text-xl" />
            </button>

            <NotificationBell />

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-background-200 bg-background-50 px-2.5 text-sm text-foreground-800 transition-colors hover:border-primary-300 hover:text-primary-700 cursor-pointer"
                >
                  {profile?.avatar_url ? (
                    <UserAvatar
                      src={profile.avatar_url}
                      name={profile?.nickname || profile?.username || '회원'}
                      sizeClass="h-6 w-6"
                    />
                  ) : null}
                  <span className="hidden max-w-[96px] truncate sm:inline">
                    {profile?.nickname || profile?.username || profile?.name || '회원'}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full w-44 pt-2">
                    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50 py-1">
                      <Link
                        to="/room"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
                      >
                        <i className="ri-book-2-line" />
                        내 기록방
                      </Link>
                      <Link
                        to="/my"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
                      >
                        <i className="ri-user-settings-line" />
                        내 정보
                      </Link>
                      {isAdmin === true && (
                        <Link
                          to="/desk"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-700 transition-colors hover:bg-primary-100 cursor-pointer"
                        >
                          <i className="ri-shield-user-line" />
                          관리자
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          await signOut();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
                      >
                        <i className="ri-logout-box-r-line" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 sm:inline-block cursor-pointer"
              >
                로그인
              </Link>
            )}

            <Link
              to="/write"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 sm:inline-flex cursor-pointer"
            >
              <i className="ri-edit-line" />
              글쓰기
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="메뉴"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-700 transition-colors hover:bg-background-100 lg:hidden cursor-pointer"
            >
              <i className={menuOpen ? 'ri-close-line text-2xl' : 'ri-menu-line text-2xl'} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-background-200 bg-background-50 lg:hidden">
            <nav className="mx-auto w-full max-w-[1280px] px-4 py-3 md:px-6">
              <Link
                to="/"
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-foreground-800 hover:bg-background-100 cursor-pointer"
              >
                홈
              </Link>
              {dropdowns.map((dd) => (
                <div key={dd.key} className="mt-1">
                  <p className="px-3 py-1 text-xs font-label uppercase tracking-wide text-foreground-400">
                    {dd.label}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {dd.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="rounded-md px-3 py-2 text-sm text-foreground-700 hover:bg-background-100 hover:text-primary-700 cursor-pointer"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link
                to="/events"
                className="mt-1 block rounded-md px-3 py-2.5 text-sm font-medium text-foreground-800 hover:bg-background-100 cursor-pointer"
              >
                이벤트
              </Link>
              <Link
                to="/about"
                className="mt-1 block rounded-md px-3 py-2.5 text-sm font-medium text-foreground-800 hover:bg-background-100 cursor-pointer"
              >
                ABOUT
              </Link>
              {user ? (
                <>
                  <Link
                    to="/room"
                    className="mt-1 block rounded-md px-3 py-2.5 text-sm font-medium text-foreground-800 hover:bg-background-100 cursor-pointer"
                  >
                    내 기록방
                  </Link>
                  <Link
                    to="/my"
                    className="mt-1 block rounded-md px-3 py-2.5 text-sm font-medium text-foreground-800 hover:bg-background-100 cursor-pointer"
                  >
                    내 정보
                  </Link>
                  {isAdmin === true && (
                    <Link
                      to="/desk"
                      className="mt-1 block rounded-md px-3 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100 cursor-pointer"
                    >
                      관리자
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/auth"
                  className="mt-1 block rounded-md px-3 py-2.5 text-sm font-medium text-foreground-800 hover:bg-background-100 cursor-pointer"
                >
                  로그인
                </Link>
              )}
              <Link
                to="/write"
                className="mt-2 flex items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3 py-2.5 text-sm font-medium text-background-50 cursor-pointer"
              >
                <i className="ri-edit-line" />
                글쓰기
              </Link>
            </nav>
          </div>
        )}
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}