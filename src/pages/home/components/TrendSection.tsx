import { useMemo, useState } from 'react';
import type { TrendCategory, TrendItem } from '@/types/home';
import { useTrends } from '@/hooks/useTrends';
import { timeAgo } from '@/lib/format';

const CATEGORY_META: Record<
  TrendCategory,
  { label: string; icon: string; badge: string; image: string }
> = {
  hotplace: {
    label: '핫플',
    icon: 'ri-map-pin-2-line',
    badge: 'bg-secondary-100 text-secondary-900',
    image:
      'https://readdy.ai/api/search-image?query=Warm%20editorial%20illustration%20of%20a%20lively%20city%20alley%20full%20of%20small%20cafes%20and%20shops%20at%20dusk%2C%20soft%20cream%20sky%2C%20terracotta%20and%20sage%20green%20palette%2C%20magazine%20trend%20cover%2C%20flat%20textured%20style&width=1200&height=800&seq=trend-hotplace&orientation=landscape',
  },
  hobby: {
    label: '취미',
    icon: 'ri-palette-line',
    badge: 'bg-accent-100 text-accent-900',
    image:
      'https://readdy.ai/api/search-image?query=Warm%20editorial%20illustration%20of%20assorted%20hobby%20objects%20such%20as%20a%20camera%20paint%20guitar%20and%20running%20shoes%20arranged%20on%20a%20soft%20cream%20background%2C%20terracotta%20sage%20green%20and%20amber%20palette%2C%20magazine%20trend%20cover%2C%20flat%20textured%20style&width=1200&height=800&seq=trend-hobby&orientation=landscape',
  },
  trend: {
    label: '유행',
    icon: 'ri-fire-line',
    badge: 'bg-primary-100 text-primary-800',
    image:
      'https://readdy.ai/api/search-image?query=Warm%20abstract%20editorial%20illustration%20of%20rising%20trend%20arrows%20and%20soft%20glowing%20shapes%20on%20a%20cream%20background%2C%20terracotta%20and%20amber%20palette%2C%20modern%20magazine%20trend%20cover%2C%20flat%20textured%20minimal%20style&width=1200&height=800&seq=trend-trend&orientation=landscape',
  },
};

const TABS: { value: 'all' | TrendCategory; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'hotplace', label: '핫플' },
  { value: 'hobby', label: '취미' },
  { value: 'trend', label: '유행' },
];

// 예시(example.com) 링크는 실제 기사가 아니므로 새 창으로 열지 않는다.
function isRealUrl(url: string): boolean {
  return Boolean(url) && !url.includes('example.com');
}

function CategoryBadge({ category }: { category: TrendCategory }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.trend;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-label ${meta.badge}`}
    >
      <i className={`${meta.icon} text-xs`} />
      {meta.label}
    </span>
  );
}

function FeaturedCard({ item, clickable }: { item: TrendItem; clickable: boolean }) {
  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.trend;
  const className = `group relative block overflow-hidden rounded-lg bg-background-100${
    clickable ? ' cursor-pointer' : ''
  }`;

  const inner = (
    <>
      <div className="h-[240px] w-full overflow-hidden md:h-[340px]">
        <img
          src={meta.image}
          alt={item.title}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/90 via-foreground-950/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <CategoryBadge category={item.category} />
        <h3 className="mt-3 line-clamp-2 font-heading text-lg font-bold leading-snug text-background-50 md:text-2xl">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-background-100/90 md:text-sm">
            {item.summary}
          </p>
        ) : null}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-background-200/90">
          <span className="truncate">{item.source || '뉴스'}</span>
          <span className="h-1 w-1 rounded-full bg-background-200/70" />
          <span className="whitespace-nowrap">{timeAgo(item.publishedAt)}</span>
        </div>
      </div>
      <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background-50/90 text-primary-700 transition-transform duration-300 group-hover:translate-x-0.5">
        <i className={clickable ? 'ri-arrow-right-up-line' : 'ri-information-line'} />
      </span>
    </>
  );

  if (!clickable) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <a href={item.url} target="_blank" rel="nofollow noopener noreferrer" className={className}>
      {inner}
    </a>
  );
}

function TrendRow({ item, index, clickable }: { item: TrendItem; index: number; clickable: boolean }) {
  const className = `group flex items-start gap-3 border-b border-background-100 py-3 last:border-b-0${
    clickable ? ' cursor-pointer' : ''
  }`;

  const inner = (
    <>
      <span className="w-6 shrink-0 pt-0.5 font-heading text-lg font-bold text-background-400">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={item.category} />
          <span className="text-[11px] text-foreground-400">
            {item.source || '뉴스'} · {timeAgo(item.publishedAt)}
          </span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-foreground-900 transition-colors group-hover:text-primary-700">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground-500">
            {item.summary}
          </p>
        ) : null}
      </div>
    </>
  );

  if (!clickable) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <a href={item.url} target="_blank" rel="nofollow noopener noreferrer" className={className}>
      {inner}
    </a>
  );
}

function TrendSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="h-[240px] w-full animate-pulse rounded-lg bg-background-100 md:h-[340px]" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] w-full animate-pulse rounded-lg bg-background-100" />
        ))}
      </div>
    </div>
  );
}

export default function TrendSection() {
  const { items, loading, error, usedFallback, fetchedAt, reload } = useTrends();
  const [active, setActive] = useState<'all' | TrendCategory>('all');

  const filtered = useMemo(
    () => (active === 'all' ? items : items.filter((it) => it.category === active)),
    [items, active],
  );

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1, 7);

  return (
    <section
      id="trend"
      className="relative overflow-hidden rounded-lg border border-background-200 bg-background-50"
    >
      <div className="border-b border-background-200 bg-background-100/60 px-4 py-4 md:px-7 md:py-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-label uppercase tracking-[0.2em] text-accent-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
              TREND DESK · 이번 주 자파리 호외
            </p>
            <h2 className="mt-1.5 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
              요즘 뭐 하고 놀아?
            </h2>
            <p className="mt-1 text-xs text-foreground-600 md:text-sm">
              19~39세 최신 트렌드 · 핫플 · 취미를 한곳에 모았어요
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-2.5 py-1 text-[11px] font-label text-secondary-900">
              <i className="ri-live-line text-xs" />
              실시간 수집 · 언제 열어도 최신 트렌드
            </p>
          </div>
          <div className="flex items-center gap-3">
            {fetchedAt && !usedFallback && (
              <span className="hidden text-[11px] text-foreground-400 sm:block">
                {timeAgo(fetchedAt)} 업데이트
              </span>
            )}
            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <i className={loading ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line'} />
              새로고침
            </button>
          </div>
        </div>

        <div className="no-scrollbar mt-4 flex gap-1 overflow-x-auto rounded-full border border-background-200 bg-background-50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActive(tab.value)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer ${
                active === tab.value
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-600 hover:bg-background-100 hover:text-primary-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-7">
        {usedFallback && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-primary-800">
              <i className="ri-error-warning-line text-base" />
              실시간 트렌드를 불러오지 못해 예시 내용을 보여주고 있어요.
            </p>
          </div>
        )}

        {loading ? (
          <TrendSkeleton />
        ) : filtered.length === 0 ? (
          <p className="rounded-lg border border-background-200 bg-background-50 px-5 py-12 text-center text-sm text-foreground-500">
            이 분야의 트렌드가 아직 없어요. 잠시 후 다시 확인해보세요.
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            {featured && (
              <FeaturedCard item={featured} clickable={isRealUrl(featured.url)} />
            )}
            <div className="flex flex-col">
              {rest.length === 0 ? (
                <p className="flex h-full items-center justify-center rounded-lg border border-background-200 bg-background-50 px-5 py-10 text-center text-xs text-foreground-500">
                  다른 분야의 트렌드도 함께 모으고 있어요.
                </p>
              ) : (
                rest.map((item, i) => (
                  <TrendRow key={item.id} item={item} index={i + 1} clickable={isRealUrl(item.url)} />
                ))
              )}
            </div>
          </div>
        )}

        {error && !usedFallback && (
          <p className="mt-4 text-center text-xs text-primary-700">{error}</p>
        )}

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-background-200 pt-3 text-[11px] text-foreground-400">
          <i className="ri-information-line" />
          각 소식은 제목과 짧은 요약만 보여드려요. 전체 내용은 언론사 원문에서 확인하세요.
        </p>
      </div>
    </section>
  );
}