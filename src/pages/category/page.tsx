import { Link, useParams } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import { mockCategories, mockPhotos } from '@/mocks/content';
import { formatDate } from '@/lib/format';
import { useCategoryContent } from '@/hooks/useCategoryContent';
import { useSeo } from '@/hooks/useSeo';
import { BRAND_NAME, SITE_URL } from '@/lib/seo';
import { collectionPageSchema } from '@/lib/schema';

const PHOTO_CAT_MAP: Record<string, string> = {
  travel: '여행',
  garden: '정원',
  food: '맛집',
  etc: '기타',
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = mockCategories.find((c) => c.slug === slug);

  useSeo(
    category
      ? {
          title: `${category.name} - ${BRAND_NAME}`,
          description: category.description,
          keywords: `${category.name}, 취미, 취미 커뮤니티, 취미 자파리`,
          path: `/category/${slug}`,
          image: category.cover_image,
          schema: collectionPageSchema({
            name: `${category.name} - ${BRAND_NAME}`,
            description: category.description,
            url: `${SITE_URL}/category/${slug}`,
          }),
        }
      : null,
    [category, slug],
  );

  const { boards, posts, loading, error } = useCategoryContent(category?.board_slugs ?? []);

  if (!category) {
    return (
      <div className="flex min-h-screen flex-col bg-background-50">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 items-center justify-center px-4 py-24">
          <div className="text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-emotion-sad-line text-3xl" />
            </span>
            <h1 className="mt-5 font-heading text-xl font-bold text-foreground-950">
              카테고리를 찾을 수 없어요
            </h1>
            <Link
              to="/"
              className="mt-4 inline-block text-sm text-primary-700 hover:underline cursor-pointer"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const photos = mockPhotos.filter((p) => p.category === PHOTO_CAT_MAP[category.slug]);

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-8">
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
          <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
            홈
          </Link>
          <i className="ri-arrow-right-s-line" />
          <span className="text-foreground-800">{category.name}</span>
        </nav>

        <section className="relative overflow-hidden rounded-lg">
          <div className="absolute inset-0">
            <img
              src={category.cover_image}
              alt={category.name}
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-foreground-950/75 via-foreground-950/40 to-foreground-950/20" />
          <div className="relative z-10 flex min-h-[300px] flex-col justify-center px-6 py-12 md:min-h-[360px] md:px-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-background-50/90 px-4 py-1.5 text-xs font-label text-primary-800">
              <i className={`${category.icon}`} />
              {category.tagline}
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold text-background-50 md:text-4xl">
              {category.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-background-100 md:text-base">
              {category.description}
            </p>
            <div className="mt-6">
              <Link
                to="/write"
                className="whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                <i className="ri-edit-line mr-1.5" />
                이 카테고리에 글쓰기
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-10 space-y-12">
          {boards.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-bold text-foreground-950 md:text-2xl">
                관련 게시판
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {boards.map((board) => (
                  <Link
                    key={board.slug}
                    to={`/board/${board.slug}`}
                    className="group flex items-center gap-4 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-300 cursor-pointer"
                  >
                    <img
                      src={board.cover_image ?? ''}
                      alt={board.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover object-top"
                    />
                    <div className="min-w-0">
                      <h3 className="font-heading text-base font-bold text-foreground-900 transition-colors group-hover:text-primary-700">
                        {board.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-foreground-500">
                        {board.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-xl font-bold text-foreground-950 md:text-2xl">
                최신 이야기
              </h2>
              <Link
                to="/explore"
                className="hidden items-center gap-1 whitespace-nowrap text-sm text-foreground-600 hover:text-primary-700 sm:flex cursor-pointer"
              >
                더 보기
                <i className="ri-arrow-right-line" />
              </Link>
            </div>
            {loading ? (
              <div className="mt-4 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg border border-background-200 bg-background-100"
                  />
                ))}
              </div>
            ) : error ? (
              <p className="mt-4 rounded-lg border border-background-200 bg-background-50 px-5 py-10 text-center text-sm text-foreground-500">
                글을 불러오지 못했어요. {error}
              </p>
            ) : posts.length === 0 ? (
              <p className="mt-4 rounded-lg border border-background-200 bg-background-50 px-5 py-10 text-center text-sm text-foreground-500">
                아직 이 카테고리에 글이 없어요. 첫 글을 남겨보세요!
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-lg border border-background-200 bg-background-50">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/board/${post.board?.slug ?? 'food'}/${post.id}`}
                    className="group flex items-center gap-4 border-b border-background-200 px-4 py-4 last:border-b-0 hover:bg-background-100 md:px-6 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-sm font-medium text-foreground-900 transition-colors group-hover:text-primary-700 md:text-base">
                        {post.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-foreground-500">
                        <span>{post.author_name}</span>
                        <span className="text-foreground-300">·</span>
                        <span>{post.view_count} views</span>
                      </div>
                    </div>
                    <span className="hidden shrink-0 text-xs text-foreground-500 md:block">
                      {formatDate(post.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {photos.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-bold text-foreground-950 md:text-2xl">
                이 공간의 사진
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <Link
                    key={photo.id}
                    to="/explore?type=photo"
                    className="group relative block overflow-hidden rounded-lg bg-background-100 cursor-pointer"
                  >
                    <div className="h-[200px] w-full overflow-hidden">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <p className="absolute inset-x-0 bottom-0 p-3 text-xs font-medium text-background-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {photo.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}