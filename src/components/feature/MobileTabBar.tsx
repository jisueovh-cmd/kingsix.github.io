import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface TabItem {
  to: string;
  label: string;
  icon: string;
  activeIcon: string;
  match: (path: string) => boolean;
}

const TABS: TabItem[] = [
  {
    to: '/',
    label: '홈',
    icon: 'ri-home-5-line',
    activeIcon: 'ri-home-5-fill',
    match: (p) => p === '/',
  },
  {
    to: '/boards',
    label: '게시판',
    icon: 'ri-layout-grid-line',
    activeIcon: 'ri-layout-grid-fill',
    match: (p) => p.startsWith('/boards') || p.startsWith('/board/') || p.startsWith('/category/'),
  },
  {
    to: '/people',
    label: '사람들',
    icon: 'ri-chat-smile-2-line',
    activeIcon: 'ri-chat-smile-2-fill',
    match: (p) => p.startsWith('/people'),
  },
  {
    to: '/my',
    label: '마이',
    icon: 'ri-user-3-line',
    activeIcon: 'ri-user-3-fill',
    match: (p) => p.startsWith('/my') || p.startsWith('/auth'),
  },
];

export default function MobileTabBar() {
  const location = useLocation();
  const { user } = useAuth();
  const path = location.pathname;

  // 글쓰기/로그인 화면에서는 몰입도를 위해 탭바를 숨겨요.
  if (path.startsWith('/write') || path.endsWith('/write')) return null;

  return (
    <nav
      aria-label="모바일 하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-background-200 bg-background-50/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex h-16 w-full max-w-[560px] items-stretch justify-around px-2">
        {TABS.slice(0, 2).map((tab) => (
          <TabLink key={tab.to} tab={tab} active={tab.match(path)} />
        ))}

        <li className="flex flex-1 items-center justify-center">
          <Link
            to="/write"
            aria-label="글쓰기"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
          >
            <i className="ri-add-line text-2xl" />
          </Link>
        </li>

        {TABS.slice(2).map((tab) => {
          const isMy = tab.to === '/my' && !user;
          return (
            <TabLink
              key={tab.to}
              tab={
                isMy
                  ? { ...tab, to: '/auth', label: '로그인', icon: 'ri-user-3-line', activeIcon: 'ri-user-3-fill' }
                  : tab
              }
              active={tab.match(path)}
            />
          );
        })}
      </ul>
    </nav>
  );
}

function TabLink({ tab, active }: { tab: TabItem; active: boolean }) {
  return (
    <li className="flex flex-1 items-center justify-center">
      <Link
        to={tab.to}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] transition-colors cursor-pointer ${
          active ? 'text-primary-700' : 'text-foreground-500'
        }`}
      >
        <i className={`${active ? tab.activeIcon : tab.icon} text-2xl`} />
        <span className="font-label">{tab.label}</span>
      </Link>
    </li>
  );
}