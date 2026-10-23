import { Link, useParams } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import WriteForm from '@/pages/write/components/WriteForm';
import { useBoards } from '@/hooks/useBoards';
import { usePostDetail } from '@/hooks/usePostDetail';
import { useAuth } from '@/hooks/useAuth';

export default function WritePage() {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const { boards, loading: boardsLoading } = useBoards();
  const { post, loading: postLoading, error: postError } = usePostDetail(postId, {
    trackView: false,
  });
  const { user } = useAuth();

  const isEditing = Boolean(postId);
  const loading = boardsLoading || (isEditing && postLoading);
  const notFound = isEditing && !postLoading && !post;
  const notOwner = isEditing && !postLoading && post && (!user || post.author_id !== user.id);

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[820px] flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6">
          <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
            <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
              홈
            </Link>
            <i className="ri-arrow-right-s-line" />
            {slug ? (
              <>
                <Link
                  to={`/board/${slug}`}
                  className="transition-colors hover:text-primary-700 cursor-pointer"
                >
                  게시판
                </Link>
                <i className="ri-arrow-right-s-line" />
              </>
            ) : null}
            <span className="text-foreground-800">{isEditing ? '글 수정' : '글쓰기'}</span>
          </nav>
          <h1 className="font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            {isEditing ? '글 수정' : '글쓰기'}
          </h1>
          <p className="mt-1 text-sm text-foreground-600">
            {isEditing ? '작성한 글을 고쳐보세요.' : '여러분의 취미 이야기를 자유롭게 남겨보세요.'}
          </p>
        </div>

        {loading ? (
          <WriteSkeleton />
        ) : notFound ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-file-warning-line text-3xl" />
            </span>
            <h2 className="mt-5 font-heading text-xl font-bold text-foreground-950">
              글을 찾을 수 없어요
            </h2>
            <p className="mt-2 text-sm text-foreground-600">
              {postError ?? '삭제되었거나 주소가 바뀐 글이에요.'}
            </p>
            <Link
              to={`/board/${slug ?? ''}`}
              className="mt-6 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              게시판으로 가기
            </Link>
          </div>
        ) : notOwner ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-lock-2-line text-3xl" />
            </span>
            <h2 className="mt-5 font-heading text-xl font-bold text-foreground-950">
              수정할 수 없는 글이에요
            </h2>
            <p className="mt-2 text-sm text-foreground-600">본인이 작성한 글만 수정할 수 있어요.</p>
            <Link
              to={`/board/${slug ?? ''}`}
              className="mt-6 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              게시판으로 가기
            </Link>
          </div>
        ) : (
          <WriteForm boards={boards} initialSlug={slug} editPost={isEditing ? post : null} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function WriteSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-lg bg-background-100" />
      <div className="h-20 animate-pulse rounded-lg bg-background-100" />
      <div className="h-20 animate-pulse rounded-lg bg-background-100" />
      <div className="h-40 animate-pulse rounded-lg bg-background-100" />
      <div className="h-16 animate-pulse rounded-lg bg-background-100" />
    </div>
  );
}