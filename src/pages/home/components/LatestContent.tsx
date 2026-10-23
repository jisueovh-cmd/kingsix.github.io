import { Link } from 'react-router-dom';
import type { PostWithBoard } from '@/types/home';
import { formatDate, excerptText } from '@/lib/format';

interface LatestContentProps {
  posts: PostWithBoard[];
}

export default function LatestContent({ posts }: LatestContentProps) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-label uppercase tracking-[0.2em] text-primary-600">
            LATEST STORIES
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            지금 나누는 이야기
          </h2>
        </div>
        <Link
          to="/explore"
          className="hidden items-center gap-1 whitespace-nowrap text-sm text-foreground-600 transition-colors hover:text-primary-700 sm:flex cursor-pointer"
        >
          전체 보기
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-background-200 bg-background-50 px-5 py-12 text-center text-sm text-foreground-500">
          아직 등록된 이야기가 없어요. 첫 글을 남겨보세요!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 6).map((post) => {
            const slug = post.board?.slug ?? 'food';
            return (
              <Link
                key={post.id}
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
                  <div className="flex items-center gap-2 text-xs text-foreground-500">
                    <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-secondary-900">
                      {post.board?.name ?? '게시판'}
                    </span>
                    <span>{post.author_name}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-foreground-400">
                    <i className="ri-eye-line" />
                    {post.view_count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {posts.length > 0 && (
        <p className="mt-4 text-right text-xs text-foreground-400">
          마지막 업데이트 {formatDate(posts[0].created_at)}
        </p>
      )}
    </section>
  );
}