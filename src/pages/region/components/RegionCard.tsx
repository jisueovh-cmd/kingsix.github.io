import { Link } from 'react-router-dom';
import { REGION_SLUG, REGION_TONE_CLASSES, regionCategoryFromTags, type RegionPost } from '@/lib/region';
import { timeAgo, excerptText } from '@/lib/format';

interface RegionCardProps {
  post: RegionPost;
  boardSlug?: string;
}

export default function RegionCard({ post, boardSlug = REGION_SLUG }: RegionCardProps) {
  const cat = regionCategoryFromTags(post.tags);
  const tone = REGION_TONE_CLASSES[cat.tone];
  // 예시(mock) 글은 실제 게시판에 없으므로, 상세로 연결하지 않고 안내 카드로만 보여준다.
  const clickable = !post.id.startsWith('mock-');

  const cardClass = `group flex flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50 transition-colors ${
    clickable ? `${tone.ring} cursor-pointer` : ''
  }`;

  const body = (
    <>
      <div className="relative h-40 w-full overflow-hidden bg-background-100">
        <img
          src={cat.image}
          alt={`${cat.label} 지역 정보 이미지`}
          title={`${post.title} - 지역 정보`}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-label ${tone.bubble}`}
        >
          <i className={`${cat.icon} text-sm`} />
          {cat.label}
        </span>
        {!clickable && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground-900/70 px-2.5 py-1 text-[11px] font-label text-background-50">
            <i className="ri-information-line text-sm" />
            예시
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-foreground-950 transition-colors group-hover:text-accent-700">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-foreground-600 md:text-sm">
          {excerptText(post.content ?? '', 140)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-background-200 pt-3 text-[11px] text-foreground-500">
          {post.location && (
            <span className="inline-flex items-center gap-1">
              <i className="ri-map-pin-line" />
              {post.location}
            </span>
          )}
          <span className="h-1 w-1 rounded-full bg-foreground-300" />
          <span className="inline-flex items-center gap-1">
            <i className="ri-user-3-line" />
            {post.author_name}
          </span>
          <span className="h-1 w-1 rounded-full bg-foreground-300" />
          <span>{timeAgo(post.created_at)}</span>
          <span className="ml-auto inline-flex items-center gap-1">
            <i className="ri-eye-line" />
            {post.view_count}
          </span>
        </div>
      </div>
    </>
  );

  if (!clickable) {
    return <div className={cardClass}>{body}</div>;
  }

  return (
    <Link to={`/board/${boardSlug}/${post.id}`} className={cardClass}>
      {body}
    </Link>
  );
}