import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import HeroSection from '@/pages/home/components/HeroSection';
import TrendSection from '@/pages/home/components/TrendSection';
import AgeGroupSection from '@/pages/home/components/AgeGroupSection';
import CategoryGrid from '@/pages/home/components/CategoryGrid';
import UserBoardsSection from '@/pages/home/components/UserBoardsSection';
import RegionSection from '@/pages/home/components/RegionSection';
import LatestContent from '@/pages/home/components/LatestContent';
import PhotoGallery from '@/pages/home/components/PhotoGallery';
import CommunitySection from '@/pages/home/components/CommunitySection';
import EventsSection from '@/pages/home/components/EventsSection';
import AboutSnippet from '@/pages/home/components/AboutSnippet';
import { useHomeData } from '@/hooks/useHomeData';

export default function Home() {
  const { posts, smallTalk, loading, error, reload, sendSmallTalk } = useHomeData();

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-8">
        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-primary-800">
              <i className="ri-error-warning-line text-base" />
              최신 소식을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
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

        {loading ? (
          <HomeSkeleton />
        ) : (
          <div className="space-y-12 md:space-y-16">
            <HeroSection />
            <TrendSection />
            <AgeGroupSection />
            <CategoryGrid />
            <UserBoardsSection />
            <RegionSection />
            <LatestContent posts={posts} />
            <PhotoGallery />
            <CommunitySection messages={smallTalk} onSend={sendSmallTalk} />
            <EventsSection />
            <AboutSnippet />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-12">
      <div className="h-[440px] w-full animate-pulse rounded-lg bg-background-100 md:h-[560px]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[240px] animate-pulse rounded-lg bg-background-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[180px] animate-pulse rounded-lg bg-background-100" />
        ))}
      </div>
      <div className="h-[360px] animate-pulse rounded-lg bg-background-100" />
    </div>
  );
}