import { Link, useSearchParams } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import { useExploreContent } from '@/hooks/useExploreContent';
import { mockPhotos } from '@/mocks/content';
import { formatDate, excerptText } from '@/lib/format';
import type { PostWithBoard } from '@/types/home';

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'story', label: '이야기' },
  { key: 'photo', label: '사진' },
  { key: 'review', label: '리뷰' },
  { key: 'place', label: '장소' },
];

function StoryCard({ post }: { post: PostWithBoard }) {
  const slug = post.board?.slug ?? 'food';
  return (
    <Link
      to={`/board/${slug}/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50 transition-colors hover:border-primary-300 cursor-pointer"
    >
      <div className="flex items-start gap-3 p-5 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {post.is_secret && (
              <i className="ri-lock-line text-sm text-primary-600" aria-label="비밀글" />
            )}
            <h3 className="line-clamp-2 font-heading text-base font-bold text-foreground-900 transition-colors group-hover:text-primary-700">
              {post.title}
            </h3>
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground-500">
            {excerptText(post.content ?? '')}
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-background-100 px-5 py-3">
        <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs text-secondary-900">
          {post.board?.name ?? '게시판'}
        </span>
        <span className="flex items-center gap-1 text-xs text-foreground-400">
          <i className="ri-eye-line" />
          {post.view_count}
        </span>
      </div>
    </Link>
  );
}

function ReviewCard({ post }: { post: PostWithBoard }) {
  const slug = post.board?.slug ?? 'food';
  const cover = post.board?.cover_image ?? null;
  return (
    <Link
      to={`/board/${slug}/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50 transition-colors hover:border-primary-300 cursor-pointer"
    >
      {cover ? (
        <div className="h-[180px] w-full overflow-hidden">
          <img
            src={cover}
            alt={post.title}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-[180px] w-full items-center justify-center bg-background-100">
          <i className="ri-star-line text-4xl text-foreground-300" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs text-secondary-900">
            {post.board?.name ?? '리뷰'}
          </span>
          <span
            className="flex items-center gap-0.5 text-amber-500"
            aria-label={`${post.rating ?? 0}점`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <i
                key={i}
                className={`text-sm ${i < (post.rating ?? 0) ? 'ri-star-fill' : 'ri-star-line'}`}
              />
            ))}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 font-heading text-base font-bold text-foreground-900 transition-colors group-hover:text-primary-700">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-foreground-500">
          {excerptText(post.content ?? '')}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-background-100 pt-3">
          <span className="text-xs text-foreground-500">{post.author_name}</span>
          <span className="text-xs text-foreground-400">{formatDate(post.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

function PlaceCard({ post }: { post: PostWithBoard }) {
  const slug = post.board?.slug ?? 'food';
  const cover = post.board?.cover_image ?? null;
  return (
    <Link
      to={`/board/${slug}/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50 transition-colors hover:border-primary-300 cursor-pointer"
    >
      {cover ? (
        <div className="h-[180px] w-full overflow-hidden">
          <img
            src={cover}
            alt={post.title}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-[180px] w-full items-center justify-center bg-background-100">
          <i className="ri-map-pin-line text-4xl text-foreground-300" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs text-accent-900">
          {post.board?.name ?? '장소'}
        </span>
        <h3 className="mt-3 font-heading text-base font-bold text-foreground-900 transition-colors group-hover:text-primary-700">
          {post.title}
        </h3>
        {post.location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-foreground-500">
            <i className="ri-map-pin-line text-sm text-primary-600" />
            {post.location}
          </p>
        )}
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-foreground-500">
          {excerptText(post.content ?? '')}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-background-100 pt-3">
          <span className="text-xs text-foreground-500">{post.author_name}</span>
          <span className="text-xs text-foreground-400">{formatDate(post.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-background-300 bg-background-50 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background-100 text-foreground-400">
        <i className="ri-file-add-line text-2xl" />
      </span>
      <p className="mt-4 font-heading text-base font-semibold text-foreground-800">
        아직 {label}이 없어요
      </p>
      <p className="mt-1 text-xs text-foreground-500">
        첫 {label}을 남겨보세요. 탐색 페이지에 바로 반영돼요.
      </p>
      <Link
        to="/write"
        className="mt-5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
      >
        <i className="ri-pencil-line" />
        글쓰기
      </Link>
    </div>
  );
}

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts, loading, error, reload } = useExploreContent();

  const type = searchParams.get('type') ?? 'all';
  const activeTab = TABS.some((t) => t.key === type) ? type : 'all';

  const setTab = (key: string) => {
    if (key === 'all') setSearchParams({});
    else setSearchParams({ type: key });
  };

  const storyPosts = posts.filter((p) => p.content_type === 'story');
  const reviewPosts = posts.filter((p) => p.content_type === 'review');
  const placePosts = posts.filter((p) => p.content_type === 'place');

  const showStories = activeTab === 'all' || activeTab === 'story';
  const showPhotos = activeTab === 'all' || activeTab === 'photo';
  const showReviews = activeTab === 'review';
  const showPlaces = activeTab === 'place';

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6">
          <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
            <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
              홈
            </Link>
            <i className="ri-arrow-right-s-line" />
            <span className="text-foreground-800">탐색</span>
          </nav>
          <h1 className="font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            콘텐츠 탐색
          </h1>
          <p className="mt-1 text-sm text-foreground-600">
            이야기, 사진, 리뷰, 장소까지 — 다양한 취미 콘텐츠를 만나보세요.
          </p>
        </div>

        <div className="mb-6 inline-flex flex-wrap items-center gap-1 rounded-full bg-background-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTab(tab.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-primary-500 font-semibold text-background-50'
                  : 'text-foreground-700 hover:bg-background-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-lg bg-background-100" />
            ))}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
                <span className="flex items-center gap-2">
                  <i className="ri-error-warning-line text-base" />
                  콘텐츠를 불러오지 못했어요.
                </span>
                <button
                  type="button"
                  onClick={reload}
                  className="whitespace-nowrap rounded-md border border-primary-300 px-3 py-1.5 text-xs font-medium text-primary-800 transition-colors hover:bg-primary-100 cursor-pointer"
                >
                  다시 시도
                </button>
              </div>
            )}

            {showStories && (
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="font-heading text-lg font-bold text-foreground-950">이야기</h2>
                  <span className="text-xs text-foreground-400">{storyPosts.length}개의 글</span>
                </div>
                {storyPosts.length === 0 ? (
                  <EmptyState label="이야기" />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {storyPosts.map((post) => (
                      <StoryCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {showPhotos && (
              <section className={showStories ? 'mt-10' : ''}>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="font-heading text-lg font-bold text-foreground-950">사진</h2>
                  <span className="text-xs text-foreground-400">{mockPhotos.length}장의 사진</span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {mockPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative block overflow-hidden rounded-lg bg-background-100"
                    >
                      <div className="h-[220px] w-full overflow-hidden">
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="line-clamp-1 text-xs font-medium text-background-50">{photo.title}</p>
                        <p className="text-[10px] text-background-100/80">{photo.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {showReviews && (
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="font-heading text-lg font-bold text-foreground-950">리뷰</h2>
                  <span className="text-xs text-foreground-400">{reviewPosts.length}개의 리뷰</span>
                </div>
                {reviewPosts.length === 0 ? (
                  <EmptyState label="리뷰" />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {reviewPosts.map((post) => (
                      <ReviewCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {showPlaces && (
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="font-heading text-lg font-bold text-foreground-950">장소</h2>
                  <span className="text-xs text-foreground-400">{placePosts.length}곳의 장소</span>
                </div>
                {placePosts.length === 0 ? (
                  <EmptyState label="장소" />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {placePosts.map((post) => (
                      <PlaceCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}