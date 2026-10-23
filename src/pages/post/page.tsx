import { Link, useParams } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import PostArticle from '@/pages/post/components/PostArticle';
import PostSidebar from '@/pages/post/components/PostSidebar';
import CommentSection from '@/pages/post/components/CommentSection';
import { usePostDetail } from '@/hooks/usePostDetail';
import { useComments } from '@/hooks/useComments';
import { useBoards } from '@/hooks/useBoards';
import { useSeo } from '@/hooks/useSeo';
import { SITE_URL, BRAND_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { blogPostingSchema } from '@/lib/schema';
import { excerptText } from '@/lib/format';

export default function PostPage() {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const { post, loading, error, reload } = usePostDetail(postId);
  const { comments, loading: commentsLoading, error: commentsError, addComment, updateComment, deleteComment, reload: reloadComments } =
    useComments(postId);
  const { boards } = useBoards();

  useSeo(
    post
      ? {
          title: `${post.title} - ${BRAND_NAME}`,
          description: excerptText(post.content ?? '', 160),
          path: `/board/${slug}/${postId}`,
          type: 'article',
          image: post.board?.cover_image ?? DEFAULT_OG_IMAGE,
          schema: blogPostingSchema({
            title: post.title,
            description: excerptText(post.content ?? '', 160),
            authorName: post.author_name,
            datePublished: post.created_at,
            url: `${SITE_URL}/board/${slug}/${postId}`,
            image: post.board?.cover_image ?? undefined,
          }),
        }
      : null,
    [post, slug, postId],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 md:px-6 md:py-8">
        {loading ? (
          <PostSkeleton />
        ) : post ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0 space-y-6">
              <PostArticle post={post} />
              <CommentSection
                comments={comments}
                loading={commentsLoading}
                error={commentsError}
                onAdd={addComment}
                onUpdate={updateComment}
                onDelete={deleteComment}
                onRetry={reloadComments}
              />
            </div>
            <PostSidebar boards={boards} currentSlug={slug} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-file-warning-line text-3xl" />
            </span>
            <h1 className="mt-5 font-heading text-xl font-bold text-foreground-950">
              글을 찾을 수 없어요
            </h1>
            <p className="mt-2 max-w-md text-sm text-foreground-600">
              {error ?? '삭제되었거나 주소가 바뀐 글이에요.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={reload}
                className="whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                다시 시도
              </button>
              <Link
                to={`/board/${slug ?? ''}`}
                className="whitespace-nowrap rounded-md border border-background-300 px-5 py-2.5 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
              >
                게시판으로 가기
              </Link>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="space-y-4 rounded-lg border border-background-200 p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-background-100" />
        <div className="h-7 w-3/4 animate-pulse rounded bg-background-100" />
        <div className="h-4 w-48 animate-pulse rounded bg-background-100" />
        <div className="h-40 animate-pulse rounded bg-background-100" />
      </div>
      <div className="h-[300px] animate-pulse rounded-lg bg-background-100" />
    </div>
  );
}