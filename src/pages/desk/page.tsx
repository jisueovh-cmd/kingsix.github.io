import { useState } from 'react';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import NotFound from '@/pages/NotFound';
import RegionGeneratorPanel from '@/pages/region/components/RegionGeneratorPanel';
import VisitorPanel from '@/pages/desk/components/VisitorPanel';
import VisitStatsPanel from '@/pages/desk/components/VisitStatsPanel';
import AdminPanel from '@/pages/desk/components/AdminPanel';
import RegionCollectedList from '@/pages/desk/components/RegionCollectedList';
import { useAuth } from '@/hooks/useAuth';
import { useRegionInfo } from '@/hooks/useRegionInfo';
import { useSeo } from '@/hooks/useSeo';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { GUNPO_HUB } from '@/lib/region';
import type { RegionHubConfig } from '@/lib/region';
import { NATION_HUB } from '@/lib/nation';

const HUBS: { key: string; hub: RegionHubConfig; label: string }[] = [
  { key: 'gunpo', hub: GUNPO_HUB, label: '군포·수도권 지역 정보' },
  { key: 'nation', hub: NATION_HUB, label: '전국 지역 정보' },
];

type DeskTab = 'region' | 'visitors' | 'stats' | 'admins';

const TABS: { key: DeskTab; label: string; icon: string }[] = [
  { key: 'region', label: '지역 정보 수집', icon: 'ri-map-pin-line' },
  { key: 'visitors', label: '접속자', icon: 'ri-radar-line' },
  { key: 'stats', label: '방문 통계', icon: 'ri-bar-chart-line' },
  { key: 'admins', label: '관리자', icon: 'ri-shield-star-line' },
];

export default function DeskPage() {
  const { loading } = useAuth();
  const isAdmin = useIsAdmin();
  const [tab, setTab] = useState<DeskTab>('region');

  useSeo(
    {
      title: '관리 데스크',
      description: '관리자만 쓰는 나만의 관리 도구.',
      path: '/desk',
      robots: 'noindex, nofollow',
    },
    [],
  );

  const resolving = loading || isAdmin === null;

  if (resolving) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-50">
        <p className="text-sm text-foreground-500">불러오는 중...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <NotFound />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[960px] flex-1 px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6 rounded-lg border border-background-200 bg-background-100/60 px-5 py-6 md:px-7">
          <p className="text-xs font-label uppercase tracking-[0.2em] text-accent-700">
            PRIVATE DESK
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            나만 보는 관리 데스크
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-600">
            이 화면은 관리자만 볼 수 있어요. 이 주소는 사이트 어디에도 링크되어 있지 않고, 정해둔
            계정으로 로그인했을 때만 열려요. 아래 탭에서 지역 정보 수집 도구와 실시간 접속자
            목록, 방문 통계, 관리자 지정을 할 수 있어요.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-1 rounded-2xl border border-background-200 bg-background-100 p-1">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                tab === item.key
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-700 hover:bg-background-200'
              }`}
            >
              <i className={item.icon} />
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'region' ? (
          <div className="space-y-9">
            {HUBS.map((item) => (
              <StudioHub key={item.key} hub={item.hub} label={item.label} />
            ))}
          </div>
        ) : tab === 'visitors' ? (
          <VisitorPanel />
        ) : tab === 'stats' ? (
          <VisitStatsPanel />
        ) : (
          <AdminPanel />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function StudioHub({ hub, label }: { hub: RegionHubConfig; label: string }) {
  const { posts, total, todayCount, loading, error, reload, generate } = useRegionInfo(
    1,
    null,
    null,
    hub,
  );

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-foreground-900">
        <i className="ri-folder-open-line text-accent-600" />
        {label}
      </h2>
      <div className="space-y-4">
        <RegionGeneratorPanel
          hub={hub}
          loggedIn
          onGenerate={generate}
          onRequireLogin={() => {}}
        />
        <RegionCollectedList
          hub={hub}
          posts={posts}
          total={total}
          todayCount={todayCount}
          loading={loading}
          error={error}
          onRetry={reload}
        />
      </div>
    </section>
  );
}