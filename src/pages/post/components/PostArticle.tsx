import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostBody from '@/components/feature/PostBody';
import type { PostWithBoard } from '@/types/home';
import { formatDate } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface PostArticleProps {
  post: PostWithBoard;
}

export default function PostArticle({ post }: PostArticleProps) {
  const boardSlug = post.board?.slug ?? '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isOwner = Boolean(user && post.author_id && post.author_id === user.id);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('author_id', user.id);
      if (res.error) throw res.error;
      navigate(`/board/${boardSlug}`, { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '글을 삭제하지 못했어요.');
      setDeleting(false);
    }
  };

  return (
    <>
      <article className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
        <div className="border-b border-background-200 px-5 py-5 md:px-7 md:py-6">
          <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
            <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
              홈
            </Link>
            <i className="ri-arrow-right-s-line" />
            <Link
              to={`/board/${boardSlug}`}
              className="transition-colors hover:text-primary-700 cursor-pointer"
            >
              {post.board?.name ?? '게시판'}
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {post.is_secret && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                <i className="ri-lock-line" />
                비밀글
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs text-secondary-900">
              {post.board?.name ?? '게시판'}
            </span>
            {post.content_type === 'review' && (
              <span
                className="inline-flex items-center gap-0.5 text-amber-500"
                aria-label={`${post.rating ?? 0}점`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`text-sm ${i < (post.rating ?? 0) ? 'ri-star-fill' : 'ri-star-line'}`}
                  />
                ))}
                <span className="ml-1 text-xs font-medium text-foreground-700">
                  {post.rating ?? 0}점
                </span>
              </span>
            )}
            {post.content_type === 'place' && post.location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-0.5 text-xs text-accent-900">
                <i className="ri-map-pin-line" />
                {post.location}
              </span>
            )}
          </div>

          <h1 className="mt-3 font-heading text-xl font-bold leading-snug text-foreground-950 md:text-2xl">
            {post.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-500">
            <span className="flex items-center gap-1.5 font-medium text-foreground-700">
              <i className="ri-user-3-line text-sm text-accent-600" />
              {post.author_name}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-calendar-line text-sm" />
              {formatDate(post.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-eye-line text-sm" />
              {post.view_count} views
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-heart-3-line text-sm text-primary-500" />
              {Math.max(0, post.like_count ?? 0)} likes
            </span>
          </div>
        </div>

        <div className="px-5 py-8 md:px-7 md:py-10">
          {post.is_secret ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-background-100 px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background-50 text-primary-600">
                <i className="ri-lock-2-line text-2xl" />
              </span>
              <p className="font-heading text-base font-semibold text-foreground-800">
                비밀글로 설정된 이야기예요
              </p>
              <p className="text-xs text-foreground-500">
                작성자만 확인할 수 있는 글입니다.
              </p>
            </div>
          ) : (
            <PostBody
              content={post.content}
              images={post.images}
              videos={post.videos}
              tags={post.tags}
              links={post.links}
              location={post.content_type === 'place' ? post.location : null}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-background-200 bg-background-100/60 px-5 py-4 md:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/board/${boardSlug}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
            >
              <i className="ri-list-unordered" />
              목록으로
            </Link>
            {isOwner && (
              <>
                <Link
                  to={`/board/${boardSlug}/${post.id}/edit`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
                >
                  <i className="ri-edit-line" />
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
                >
                  <i className="ri-delete-bin-line" />
                  삭제
                </button>
              </>
            )}
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
          >
            <i className="ri-home-5-line" />
            홈으로
          </Link>
        </div>
      </article>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground-950/50 p-4"
          onClick={() => !deleting && setDeleteOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-background-200 bg-background-50 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-base font-bold text-foreground-950">
              글을 삭제할까요?
            </h3>
            <p className="mt-2 text-sm text-foreground-600">
              삭제한 글은 되돌릴 수 없어요. 정말 삭제하시겠어요?
            </p>
            {deleteError && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-primary-700">
                <i className="ri-error-warning-line" />
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  <>
                    <i className="ri-delete-bin-line" />
                    삭제
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}