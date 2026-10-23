import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import { NAV_AGE_GROUPS, NAV_BOARDS, SITE_NAME } from '@/lib/nav';
import { useSeo } from '@/hooks/useSeo';
import { BRAND_NAME, SITE_URL } from '@/lib/seo';
import { collectionPageSchema } from '@/lib/schema';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/feature/ToastProvider';
import { useBoards } from '@/hooks/useBoards';
import { sortUserBoards } from '@/lib/boards';
import UserBoardCard from '@/components/feature/UserBoardCard';
import CreateBoardModal from '@/pages/boards/components/CreateBoardModal';
import type { Board } from '@/types/home';

const BOARD_META: Record<string, { icon: string; tagline: string; tone: 'primary' | 'accent' | 'secondary' }> = {
  travel: { icon: 'ri-suitcase-line', tagline: '세상 곳곳을 누비는 여행 기록', tone: 'accent' },
  food: { icon: 'ri-restaurant-2-line', tagline: '숨은 맛집과 오늘의 한 끼', tone: 'primary' },
  honey: { icon: 'ri-star-line', tagline: '반짝이는 별별 꿀팁 모음', tone: 'accent' },
  collect: { icon: 'ri-archive-2-line', tagline: '모으고 싶은 것들의 방', tone: 'secondary' },
  garden: { icon: 'ri-plant-line', tagline: '초록을 키우는 사람들', tone: 'accent' },
  make: { icon: 'ri-hammer-line', tagline: '손으로 만드는 즐거움', tone: 'primary' },
  together: { icon: 'ri-group-line', tagline: '같이 하면 더 재밌는 취미', tone: 'secondary' },
  hobbyist: { icon: 'ri-user-star-line', tagline: '취미를 사랑하는 사람들', tone: 'primary' },
};

const AGE_META: Record<string, { decade: string; icon: string; tone: 'primary' | 'accent' | 'secondary' }> = {
  'age-10': { decade: '10대', icon: 'ri-emotion-happy-line', tone: 'accent' },
  'age-20': { decade: '20대', icon: 'ri-fire-line', tone: 'primary' },
  'age-30': { decade: '30대', icon: 'ri-cup-line', tone: 'secondary' },
  'age-40': { decade: '40대', icon: 'ri-plant-line', tone: 'accent' },
  'age-50': { decade: '50대', icon: 'ri-camera-lens-line', tone: 'primary' },
  'age-60': { decade: '60대', icon: 'ri-sun-line', tone: 'secondary' },
};

const TONE: Record<
  'primary' | 'accent' | 'secondary',
  { bubble: string; ring: string; hover: string }
> = {
  primary: {
    bubble: 'bg-primary-100 text-primary-700',
    ring: 'border-primary-200',
    hover: 'group-hover:border-primary-300',
  },
  accent: {
    bubble: 'bg-accent-100 text-accent-700',
    ring: 'border-accent-200',
    hover: 'group-hover:border-accent-300',
  },
  secondary: {
    bubble: 'bg-secondary-100 text-secondary-800',
    ring: 'border-secondary-200',
    hover: 'group-hover:border-secondary-300',
  },
};

export default function BoardsPage() {
  useSeo({
    title: `게시판 모음 - ${BRAND_NAME}`,
    description: `${SITE_NAME}의 모든 게시판을 한눈에. 맛집, 별팁, 정원, 제작 공방과 10대~60대 나이대별 취미방을 확인하세요.`,
    keywords: '게시판, 취미, 커뮤니티, 나이대별 취미, 취미 자파리',
    path: '/boards',
    schema: collectionPageSchema({
      name: `게시판 모음 - ${BRAND_NAME}`,
      description: `${SITE_NAME}의 모든 게시판을 한눈에 모아봤어요.`,
      url: `${SITE_URL}/boards`,
    }),
  }, []);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { boards, reload } = useBoards();
  const userBoards = sortUserBoards(boards);
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = () => {
    if (!user) {
      toast('로그인 후 게시판을 만들 수 있어요.', 'info');
      navigate('/auth');
      return;
    }
    setCreateOpen(true);
  };

  const handleCreated = (board: Board) => {
    setCreateOpen(false);
    reload();
    navigate(`/board/${board.slug}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-8">
        <section className="overflow-hidden rounded-lg border border-background-200 bg-background-100/60 px-5 py-8 md:px-9 md:py-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-label uppercase tracking-[0.2em] text-primary-600">ALL BOARDS</p>
              <h1 className="mt-2 font-heading text-3xl font-bold text-foreground-950 md:text-4xl">
                게시판 모음
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-600">
                관심 있는 방을 골라 들어가 보세요. 취미 게시판과 나이대별 취미방, 어디든 환영이에요.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              <i className="ri-add-line text-base" />
              새 게시판 만들기
            </button>
          </div>
        </section>

        <section className="mt-10">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Link
              to="/region"
              className="group flex flex-col gap-4 overflow-hidden rounded-lg border border-accent-200 bg-accent-50/70 p-5 transition-colors hover:border-accent-300 md:flex-row md:items-center md:gap-6 md:p-6 cursor-pointer"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-background-50">
                <i className="ri-map-pin-2-line text-2xl" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent-500/15 px-2.5 py-0.5 text-[11px] font-label text-accent-800">
                    NEW
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-label text-foreground-500">
                    <i className="ri-notification-3-line" />
                    매일 새 소식
                  </span>
                </div>
                <h3 className="mt-2 font-heading text-lg font-bold text-foreground-950 transition-colors group-hover:text-accent-700 md:text-xl">
                  군포·수도권 지역 정보
                </h3>
                <p className="mt-1 text-xs text-foreground-600 md:text-sm">
                  군포를 우선으로 서울·인천·경기 수도권의 여행지·맛집·나들이·축제 정보를 모아둔 곳.
                  매일 새로운 지역 소식이 올라와요.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-accent-500 px-4 py-2.5 text-sm font-medium text-background-50 transition-colors group-hover:bg-accent-600">
                들어가기
                <i className="ri-arrow-right-line" />
              </span>
            </Link>

            <Link
              to="/nation"
              className="group flex flex-col gap-4 overflow-hidden rounded-lg border border-primary-200 bg-primary-50/70 p-5 transition-colors hover:border-primary-300 md:flex-row md:items-center md:gap-6 md:p-6 cursor-pointer"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-background-50">
                <i className="ri-earth-line text-2xl" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary-500/15 px-2.5 py-0.5 text-[11px] font-label text-primary-800">
                    NEW
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-label text-foreground-500">
                    <i className="ri-earth-line" />
                    전국 8도
                  </span>
                </div>
                <h3 className="mt-2 font-heading text-lg font-bold text-foreground-950 transition-colors group-hover:text-primary-700 md:text-xl">
                  전국 지역 정보
                </h3>
                <p className="mt-1 text-xs text-foreground-600 md:text-sm">
                  울릉도·독도까지, 수도권·강원·충청·전라·경상·제주 전 지역의 여행지·맛집 정보를
                  모아둔 곳. 곳곳의 새 소식을 만날 수 있어요.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-medium text-background-50 transition-colors group-hover:bg-primary-600">
                들어가기
                <i className="ri-arrow-right-line" />
              </span>
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-label uppercase tracking-[0.2em] text-accent-700">HOBBIES</p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
                취미 게시판
              </h2>
            </div>
            <span className="hidden text-xs font-label uppercase tracking-[0.2em] text-foreground-400 md:block">
              8 SPACES
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NAV_BOARDS.map((board) => {
              const meta = BOARD_META[board.slug] ?? BOARD_META.honey;
              const tone = TONE[meta.tone];
              return (
                <Link
                  key={board.slug}
                  to={`/board/${board.slug}`}
                  className={`group flex items-center gap-4 rounded-lg border ${tone.ring} ${tone.hover} bg-background-50 p-4 md:p-5 transition-colors cursor-pointer`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tone.bubble}`}>
                    <i className={`${meta.icon} text-xl`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base font-bold text-foreground-900 transition-colors group-hover:text-primary-700">
                      {board.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-foreground-500">{meta.tagline}</p>
                  </div>
                  <i className="ri-arrow-right-s-line shrink-0 text-xl text-foreground-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary-600" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12" id="age">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-label uppercase tracking-[0.2em] text-primary-600">10s &mdash; 60s</p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
                나이대별 취미방
              </h2>
            </div>
            <span className="hidden text-xs font-label uppercase tracking-[0.2em] text-foreground-400 md:block">
              6 ROOMS
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NAV_AGE_GROUPS.map((room) => {
              const slug = room.to.replace('/board/', '');
              const meta = AGE_META[slug] ?? AGE_META['age-20'];
              const tone = TONE[meta.tone];
              return (
                <Link
                  key={room.to}
                  to={room.to}
                  className={`group flex items-center gap-4 rounded-lg border ${tone.ring} ${tone.hover} bg-background-50 p-4 md:p-5 transition-colors cursor-pointer`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tone.bubble}`}>
                    <i className={`${meta.icon} text-xl`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-label text-foreground-500">{meta.decade}</p>
                    <h3 className="mt-0.5 font-heading text-base font-bold text-foreground-900 transition-colors group-hover:text-primary-700">
                      {room.label}
                    </h3>
                  </div>
                  <i className="ri-arrow-right-s-line shrink-0 text-xl text-foreground-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary-600" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12" id="user-boards">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-label uppercase tracking-[0.2em] text-secondary-700">MADE BY MEMBERS</p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
                함께 만든 게시판
              </h2>
              <p className="mt-1.5 text-xs text-foreground-600 md:text-sm">
                회원들이 직접 만든 게시판이에요. 나만의 주제로 새 게시판을 열어보세요.
              </p>
            </div>
            <span className="hidden text-xs font-label uppercase tracking-[0.2em] text-foreground-400 md:block">
              {userBoards.length} SPACES
            </span>
          </div>

          {userBoards.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userBoards.map((board) => (
                <UserBoardCard key={board.id} board={board} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-background-300 bg-background-50 px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-100 text-secondary-800">
                <i className="ri-add-circle-line text-2xl" />
              </span>
              <p className="mt-4 font-heading text-base font-bold text-foreground-950">
                아직 회원이 만든 게시판이 없어요
              </p>
              <p className="mt-1 text-sm text-foreground-600">
                첫 번째 게시판을 직접 만들어보세요.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                <i className="ri-add-line" />
                새 게시판 만들기
              </button>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />

      {createOpen && (
        <CreateBoardModal onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}