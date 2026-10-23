import { useEffect, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import type { PostWithBoard, ContentType } from '@/types/home';
import { timeAgo, excerptText } from '@/lib/format';
import { useReactions } from '@/hooks/useReactions';

const TYPE_LABEL: Record<ContentType, string> = {
  story: '이야기',
  photo: '사진',
  review: '리뷰',
  place: '장소',
};

const TYPE_STYLE: Record<ContentType, string> = {
  story: 'bg-secondary-100 text-secondary-900',
  photo: 'bg-accent-100 text-accent-900',
  review: 'bg-primary-100 text-primary-800',
  place: 'bg-amber-100 text-amber-900',
};

interface PostCardProps {
  post: PostWithBoard;
}

export default function PostCard({ post }: PostCardProps) {
  const { isLiked, isBookmarked, toggleLike, toggleBookmark } = useReactions();
  const liked = isLiked(post.id);
  const bookmarked = isBookmarked(post.id);
  // 좋아요 수는 조회수에서 파생하지 않는다. DB에 저장된 실제 값만 사용하고, 내가 누를 때만 바뀐다.
  const [likeCount, setLikeCount] = useState(() => Math.max(0, post.like_count ?? 0));

  useEffect(() => {
    setLikeCount(Math.max(0, post.like_count ?? 0));
  }, [post.like_count]);

  const boardSlug = post.board?.slug ?? '';
  const thumb = post.images?.[0];

  const onBookmark = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void toggleBookmark(post.id);
  };

  const onLike = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void toggleLike(post.id).then((res) => {
      if (typeof res.likeCount === 'number') setLikeCount(Math.max(0, res.likeCount));
    });
  };

  return (
    <article className="group flex gap-4 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-300 hover:bg-background-100/40">
      {thumb ? (
        <Link
          to={`/board/${boardSlug}/${post.id}`}
          className="shrink-0 overflow-hidden rounded-md border border-background-200"
        >
          <img
            src={thumb}
            alt={post.title}
            title={post.title}
            className="h-24 w-24 object-cover object-top md:h-28 md:w-36"
          />
        </Link>
      ) : (
        <Link
          to={`/board/${boardSlug}/${post.id}`}
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md border border-background-200 bg-secondary-100 text-secondary-700 transition-colors hover:bg-secondary-200 md:h-28 md:w-36"
        >
          <i className="ri-quill-pen-line text-2xl" />
        </Link>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[post.content_type]}`}
          >
            {TYPE_LABEL[post.content_type]}
          </span>
          {post.is_secret && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground-100 px-2 py-0.5 text-xs text-foreground-600">
              <i className="ri-lock-line" />
              비밀글
            </span>
          )}
        </div>

        <Link to={`/board/${boardSlug}/${post.id}`} className="mt-1.5 block">
          <h3 className="line-clamp-1 font-heading text-base font-bold text-foreground-950 transition-colors group-hover:text-primary-700">
            {post.title}
          </h3>
        </Link>

        {!post.is_secret && post.content && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground-600 md:text-sm">
            {excerptText(post.content)}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-background-100 px-2 py-0.5 text-xs text-foreground-600"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground-500">
          <span className="flex items-center gap-1.5 font-medium text-foreground-700">
            <i className="ri-user-3-line text-sm text-accent-600" />
            {post.author_name}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-time-line text-sm" />
            {timeAgo(post.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-eye-line text-sm" />
            {post.view_count}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-chat-3-line text-sm" />
            {post.comment_count ?? 0}
          </span>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              onClick={onLike}
              aria-label="좋아요"
              aria-pressed={liked}
              className="flex items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-background-100 cursor-pointer"
            >
              <i
                className={`text-base ${liked ? 'ri-heart-3-fill text-primary-500' : 'ri-heart-3-line'}`}
              />
              {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
            </button>
            <button
              type="button"
              onClick={onBookmark}
              aria-label="저장"
              aria-pressed={bookmarked}
              className="flex items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-background-100 cursor-pointer"
            >
              <i
                className={`text-base ${bookmarked ? 'ri-bookmark-fill text-accent-600' : 'ri-bookmark-line'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}