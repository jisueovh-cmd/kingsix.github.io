import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import BoardHeader from '@/pages/board/components/BoardHeader';
import BoardSidebar from '@/pages/board/components/BoardSidebar';
import FeedControls from '@/pages/board/components/FeedControls';
import PostList from '@/pages/board/components/PostList';
import Pagination from '@/pages/board/components/Pagination';
import { BOARD_PAGE_SIZE, useBoardPosts, type BoardSort } from '@/hooks/useBoardPosts';
import { useSeo } from '@/hooks/useSeo';
import { BRAND_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { collectionPageSchema } from '@/lib/schema';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/feature/ToastProvider';
import { canManageBoard } from '@/lib/boards';
import BoardManageModal from '@/pages/board/components/BoardManageModal';

export default function BoardPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const [sort, setSort] = useState<BoardSort>('latest');
  const [tag, setTag] = useState<string | null>(null);

  const { board, boards, posts, total, allTags, loading, error, reload } = useBoardPosts(
    slug,
    page,
    sort,
    tag,
  );

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [manageOpen, setManageOpen] = useState(false);
  const canManage = canManageBoard(board, user?.id);

  const handleUpdated = () => {
    setManageOpen(false);
    toast('게시판 정보를 수정했어요.', 'success');
    reload();
  };

  const handleDeleted = () => {
    setManageOpen(false);
    toast('게시판을 삭제했어요.', 'success');
    navigate('/boards');
  };

  useSeo(
    board
      ? {
          title: `${board.name} - ${BRAND_NAME}`,
          description: board.description ?? `${board.name} 게시판의 최신 글을 확인하세요. 취미 자파리 커뮤니티.`,
          keywords: `${board.name}, 게시판, 취미, 취미 자파리`,
          path: `/board/${slug}`,
          image: board.cover_image ?? DEFAULT_OG_IMAGE,
          schema: collectionPageSchema({
            name: `${board.name} - ${BRAND_NAME}`,
            description: board.description ?? `${board.name} 게시판의 최신 글을 확인하세요.`,
            url: `${SITE_URL}/board/${slug}`,
          }),
        }
      : null,
    [board, slug],
  );

  const totalPages = Math.max(1, Math.ceil(total / BOARD_PAGE_SIZE));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const goToPage = (next: number) => {
    if (next <= 1) {
      setSearchParams({});
    } else {
      setSearchParams({ page: String(next) });
    }
  };

  const changeSort = (next: BoardSort) => {
    setSort(next);
    goToPage(1);
  };

  const changeTag = (next: string | null) => {
    setTag(next);
    goToPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-8">
        {error && board && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-primary-800">
              <i className="ri-error-warning-line text-base" />
              최신 글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
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
          <BoardSkeleton />
        ) : error && !board ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <i className="ri-wifi-off-line text-3xl" />
            </span>
            <h1 className="mt-5 font-heading text-xl font-bold text-foreground-950">
              게시판을 불러오지 못했어요
            </h1>
            <p className="mt-2 text-sm text-foreground-600">
              네트워크가 불안정할 수 있어요. 잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-6 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              <i className="ri-refresh-line" />
              다시 시도
            </button>
          </div>
        ) : board ? (
          <div className="space-y-6">
            <BoardHeader
              board={board}
              total={total}
              canManage={canManage}
              onManage={() => setManageOpen(true)}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-heading text-sm font-bold text-foreground-700">전체 글</h2>
                  <Link
                    to={`/board/${slug}/write`}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
                  >
                    <i className="ri-edit-line" />
                    글쓰기
                  </Link>
                </div>
                <FeedControls
                  sort={sort}
                  onSortChange={changeSort}
                  tags={allTags}
                  activeTag={tag}
                  onTagChange={changeTag}
                />
                <div className="mt-4">
                  <PostList posts={posts} />
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
              </div>
              <BoardSidebar boards={boards} currentSlug={slug} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-emotion-sad-line text-3xl" />
            </span>
            <h1 className="mt-5 font-heading text-xl font-bold text-foreground-950">
              게시판을 찾을 수 없어요
            </h1>
            <p className="mt-2 text-sm text-foreground-600">
              주소가 바뀌었거나 삭제된 게시판이에요. 홈에서 다시 찾아보세요.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />

      {manageOpen && board && (
        <BoardManageModal
          board={board}
          onClose={() => setManageOpen(false)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-[240px] animate-pulse rounded-lg bg-background-100" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-full bg-background-100" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] animate-pulse rounded-lg bg-background-100" />
          ))}
        </div>
        <div className="h-[320px] animate-pulse rounded-lg bg-background-100" />
      </div>
    </div>
  );
}