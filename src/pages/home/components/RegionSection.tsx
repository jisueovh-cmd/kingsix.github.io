import { Link } from 'react-router-dom';
import {
  REGION_CATEGORIES,
  REGION_GROUPS,
  REGION_SLUG,
  REGION_TONE_CLASSES,
} from '@/lib/region';
import RegionCard from '@/pages/region/components/RegionCard';
import { useRegionPreview } from '@/hooks/useRegionPreview';

const BENEFITS = [
  { icon: 'ri-map-pin-2-line', label: '군포 우선' },
  { icon: 'ri-notification-3-line', label: '매일 새 소식' },
  { icon: 'ri-compass-3-line', label: '수도권 전 지역' },
];

export default function RegionSection() {
  // 홈 미리보기는 실제 게시판의 최신 글을 그대로 가져온다(존재하지 않는 글로 연결 방지).
  const { posts, loading } = useRegionPreview(REGION_SLUG, 3);
  return (
    <section id="region-info">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-label uppercase tracking-[0.2em] text-accent-700">
            LOCAL GUIDE
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            군포·수도권 지역 정보
          </h2>
          <p className="mt-1.5 text-xs text-foreground-600 md:text-sm">
            군포를 먼저, 서울·인천·경기까지 여행지·맛집·나들이 정보를 한곳에서
          </p>
        </div>
        <Link
          to="/region"
          className="hidden items-center gap-1 whitespace-nowrap text-sm text-foreground-600 transition-colors hover:text-accent-700 sm:flex cursor-pointer"
        >
          지역 정보 전체 보기
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Warm%20editorial%20flat%20illustration%20of%20a%20travel%20guide%20map%20of%20Gunpo%20and%20the%20Seoul%20metropolitan%20area%20with%20classic%20landmarks%2C%20a%20lake%20park%2C%20small%20shops%20and%20mountain%20trails%2C%20cream%20and%20terracotta%20and%20sage%20green%20palette%2C%20cozy%20magazine%20cover%20style&width=1600&height=900&seq=gunpo-region-hero&orientation=landscape"
            alt="군포·수도권 지역 정보 배경 일러스트"
            title="군포·수도권 지역 정보"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/40 to-black/60" />
        </div>

        <div className="relative w-full px-5 py-8 md:px-10 md:py-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/15 px-3 py-1 text-xs font-label text-background-50 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
              LIVE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/90 px-3 py-1 text-xs font-label text-background-50">
              <i className="ri-map-pin-2-fill" />
              군포 우선
            </span>
          </div>

          <h3 className="mt-4 max-w-2xl font-heading text-2xl font-bold leading-tight text-background-50 md:text-4xl">
            우리 동네 여행지·맛집, 여기서 다 찾아요
          </h3>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-background-100 md:text-sm">
            군포 산본·금정·당동부터 수원·성남·서울·인천까지, 가본 사람만 아는 구체적인 팁까지
            함께 모아요. 새로 연 가게나 동네 소식도 놓치지 않아요.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              to="/region"
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-accent-600 sm:w-auto cursor-pointer"
            >
              <i className="ri-compass-3-line" />
              지역 정보 바로가기
            </Link>
            <Link
              to={`/board/${REGION_SLUG}/write`}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-background-50 px-5 py-3 text-sm font-semibold text-foreground-900 transition-colors hover:bg-background-100 sm:w-auto cursor-pointer"
            >
              <i className="ri-edit-line" />
              정보 올리기
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
            {BENEFITS.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 text-xs font-label text-background-100"
              >
                <i className={`${b.icon} text-base text-accent-300`} />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="inline-flex items-center gap-2 font-heading text-lg font-bold text-foreground-950 md:text-xl">
              <i className="ri-live-line text-accent-600" />
              최신 지역 정보
            </h3>
            <p className="mt-1 text-xs text-foreground-600 md:text-sm">
              방금 올라온 군포·수도권 소식을 먼저 만나보세요
            </p>
          </div>
          <Link
            to="/region"
            className="flex items-center gap-1 whitespace-nowrap text-sm text-foreground-600 transition-colors hover:text-accent-700 cursor-pointer"
          >
            더보기
            <i className="ri-arrow-right-line" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[320px] animate-pulse rounded-lg bg-background-100" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <RegionCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-map-pin-2-line text-2xl" />
            </span>
            <p className="mt-4 font-heading text-base font-semibold text-foreground-800">
              아직 올라온 지역 정보가 없어요
            </p>
            <p className="mt-1 text-xs text-foreground-500">
              지역 정보 게시판에서 우리 동네 소식을 나눠보세요!
            </p>
            <Link
              to="/region"
              className="mt-4 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-accent-500 px-4 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-accent-600 cursor-pointer"
            >
              <i className="ri-compass-3-line" />
              지역 정보 보러 가기
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-label text-foreground-500">
          <i className="ri-map-pin-2-line" />
          지역
        </span>
        {REGION_GROUPS.map((group) => (
          <Link
            key={group.key}
            to={`/region?area=${group.key}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-background-300 bg-background-50 px-3.5 py-2 text-xs font-medium text-foreground-700 transition-colors hover:border-accent-300 hover:text-accent-700 cursor-pointer"
          >
            <i className={`${group.icon} text-base`} />
            {group.label}
          </Link>
        ))}
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
        {REGION_CATEGORIES.map((cat) => {
          const tone = REGION_TONE_CLASSES[cat.tone];
          return (
            <Link
              key={cat.key}
              to={`/region?cat=${cat.key}`}
              className={`group flex w-[150px] shrink-0 snap-start flex-col items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-4 text-center transition-colors sm:w-auto sm:shrink ${tone.ring} cursor-pointer`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${tone.bubble}`}
              >
                <i className={`${cat.icon} text-2xl`} />
              </span>
              <span className="font-heading text-sm font-bold text-foreground-900 transition-colors group-hover:text-accent-700">
                {cat.label}
              </span>
              <span className="line-clamp-2 text-[11px] leading-snug text-foreground-500">
                {cat.tagline}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        to={`/board/${REGION_SLUG}`}
        className="mt-4 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-3 text-sm font-medium text-foreground-800 transition-colors hover:border-accent-300 hover:text-accent-700 sm:hidden cursor-pointer"
      >
        <i className="ri-compass-3-line" />
        지역 정보 게시판 전체 보기
      </Link>
    </section>
  );
}