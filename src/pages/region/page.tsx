import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import RegionHero from '@/pages/region/components/RegionHero';
import RegionCrossLink from '@/pages/region/components/RegionCrossLink';
import RegionCard from '@/pages/region/components/RegionCard';
import Pagination from '@/pages/board/components/Pagination';
import { GUNPO_HUB, REGION_CATEGORIES, REGION_TONE_CLASSES } from '@/lib/region';
import { REGION_PAGE_SIZE, useRegionInfo } from '@/hooks/useRegionInfo';
import { useSeo } from '@/hooks/useSeo';
import { BRAND_NAME, SITE_URL } from '@/lib/seo';
import { collectionPageSchema, faqPageSchema } from '@/lib/schema';

const REGION_FAQ = GUNPO_HUB.faq;

export default function RegionPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const catKey = searchParams.get('cat');
  const areaKey = searchParams.get('area');
  const activeCat = REGION_CATEGORIES.find((c) => c.key === catKey) ?? null;
  const activeArea = GUNPO_HUB.groups.find((g) => g.key === areaKey) ?? null;

  const { board, posts, total, todayCount, loading, error, reload } = useRegionInfo(
    page,
    activeCat?.label ?? null,
    activeArea?.label ?? null,
    GUNPO_HUB,
  );

  useSeo(
    {
      title: `군포·수도권 지역 정보 - ${BRAND_NAME}`,
      description:
        '군포를 우선으로 서울·인천·경기 수도권의 여행지·맛집·카페·나들이·축제 정보를 한곳에 모은 군포 지역 정보 게시판입니다.',
      keywords: '군포 맛집, 군포 여행지, 수도권 여행, 군포 지역 정보, 경기 맛집, 군포 나들이',
      path: '/region',
      image: board?.cover_image ?? undefined,
      schema: [
        collectionPageSchema({
          name: `군포·수도권 지역 정보 - ${BRAND_NAME}`,
          description: '군포를 우선으로 수도권 여행지·맛집·나들이 정보를 모아둔 지역 정보 게시판입니다.',
          url: `${SITE_URL}/region`,
        }),
        faqPageSchema(REGION_FAQ),
      ],
    },
    [board?.cover_image],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, catKey, areaKey]);

  const buildParams = (next: { cat?: string | null; area?: string | null; page?: number }) => {
    const params: Record<string, string> = {};
    const nextCat = next.cat !== undefined ? next.cat : catKey;
    const nextArea = next.area !== undefined ? next.area : areaKey;
    if (nextCat) params.cat = nextCat;
    if (nextArea) params.area = nextArea;
    if (next.page && next.page > 1) params.page = String(next.page);
    setSearchParams(params);
  };

  const totalPages = Math.max(1, Math.ceil(total / REGION_PAGE_SIZE));

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="space-y-8 md:space-y-10">
          <RegionHero hub={GUNPO_HUB} total={total} todayCount={todayCount} />

          {error && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
              <p className="flex items-center gap-2 text-xs text-primary-800">
                <i className="ri-error-warning-line text-base" />
                지역 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
              </p>
              <button
                type="button"
                onClick={reload}
                className="whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          )}

          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-label uppercase tracking-[0.2em] text-accent-700">
                  LOCAL GUIDE
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
                  지금 올라온 지역 정보
                  <span className="ml-2 align-middle text-sm font-normal text-foreground-500">
                    {total.toLocaleString()}개
                  </span>
                </h2>
              </div>
              <Link
                to={`/board/${GUNPO_HUB.slug}/write`}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-sm font-medium text-foreground-800 transition-colors hover:border-primary-300 hover:text-primary-700 cursor-pointer"
              >
                <i className="ri-edit-line" />
                직접 정보 올리기
              </Link>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-label text-foreground-500">
                <i className="ri-map-pin-2-line" />
                지역
              </span>
              <button
                type="button"
                onClick={() => buildParams({ area: null })}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  activeArea === null
                    ? 'border-foreground-900 bg-foreground-900 text-background-50'
                    : 'border-background-300 bg-background-50 text-foreground-700 hover:border-foreground-400'
                }`}
              >
                <i className="ri-earth-line text-base" />
                수도권 전체
              </button>
              {GUNPO_HUB.groups.map((group) => {
                const active = group.key === areaKey;
                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => buildParams({ area: group.key })}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? `${REGION_TONE_CLASSES.accent.chipActive}`
                        : 'border-background-300 bg-background-50 text-foreground-700 hover:border-accent-300'
                    }`}
                  >
                    <i className={`${group.icon} text-base`} />
                    {group.label}
                  </button>
                );
              })}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-label text-foreground-500">
                <i className="ri-price-tag-3-line" />
                분야
              </span>
              <button
                type="button"
                onClick={() => buildParams({ cat: null })}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  activeCat === null
                    ? 'border-foreground-900 bg-foreground-900 text-background-50'
                    : 'border-background-300 bg-background-50 text-foreground-700 hover:border-foreground-400'
                }`}
              >
                <i className="ri-apps-2-line text-base" />
                전체
              </button>
              {REGION_CATEGORIES.map((cat) => {
                const tone = REGION_TONE_CLASSES[cat.tone];
                const active = cat.key === catKey;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => buildParams({ cat: cat.key })}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      active ? tone.chipActive : tone.chip
                    }`}
                  >
                    <i className={`${cat.icon} text-base`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <RegionGridSkeleton />
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-20 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                  <i className="ri-map-pin-2-line text-2xl" />
                </span>
                <p className="mt-4 font-heading text-base font-semibold text-foreground-800">
                  아직 이 분야의 지역 정보가 없어요
                </p>
                <p className="mt-1 text-xs text-foreground-500">
                  첫 지역 소식을 직접 남겨보세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
                {posts.map((post) => (
                  <RegionCard key={post.id} post={post} />
                ))}
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={(next) => buildParams({ page: next })} />
          </section>

          <RegionCrossLink
            to="/nation"
            eyebrow="GO NATIONWIDE"
            title="군포를 넘어 전국으로 — 전국 지역 정보도 있어요"
            description="수도권 정보를 다 봤다면, 이제 울릉도·독도까지 전국의 여행지·맛집·나들이 정보를 한 번에 둘러보세요."
            ctaLabel="전국 지역 정보로 이동"
            highlights={['수도권·강원·충청·전라·경상·제주', '울릉도·독도 포함']}
          />

          <section className="rounded-lg border border-background-200 bg-background-100/50 px-5 py-6 md:px-7 md:py-7">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-100 text-secondary-800">
                <i className="ri-question-line text-lg" />
              </span>
              <h2 className="font-heading text-lg font-bold text-foreground-950">
                군포·수도권 지역 정보 자주 묻는 질문
              </h2>
            </div>
            <dl className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {REGION_FAQ.map((item) => (
                <div
                  key={item.question}
                  className="rounded-lg border border-background-200 bg-background-50 p-4"
                >
                  <dt className="font-heading text-sm font-bold text-foreground-900">
                    {item.question}
                  </dt>
                  <dd className="mt-2 text-xs leading-relaxed text-foreground-600">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function RegionGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-[320px] animate-pulse rounded-lg bg-background-100" />
      ))}
    </div>
  );
}