import { Link } from 'react-router-dom';
import type { RegionHubConfig, RegionPost } from '@/lib/region';
import { timeAgo } from '@/lib/format';

interface RegionCollectedListProps {
  hub: RegionHubConfig;
  posts: RegionPost[];
  total: number;
  todayCount: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

// 관리자 데스크의 '지역 정보 수집' 탭에서, 실제로 게시판에 쌓인 글을 바로 확인할 수 있게 보여준다.
// (수집 결과가 화면에 없어 '비어 보이던' 문제를 해결)
export default function RegionCollectedList({
  hub,
  posts,
  total,
  todayCount,
  loading,
  error,
  onRetry,
}: RegionCollectedListProps) {
  const recent = posts.slice(0, 6);

  return (
    <div className="rounded-lg border border-background-200 bg-background-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-background-200 px-5 py-3.5">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-foreground-900">
          <i className="ri-archive-2-line text-accent-600" />
          최근 수집 현황
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-foreground-600">
            전체 <strong className="text-foreground-900">{total}</strong>개 · 오늘{' '}
            <strong className="text-foreground-900">{todayCount}</strong>개
          </span>
          <Link
            to={`/board/${hub.slug}`}
            className="flex items-center gap-1 whitespace-nowrap rounded-md border border-background-300 px-3 py-1.5 text-xs font-medium text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
          >
            게시판 열기
            <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="px-5 py-8 text-center text-sm text-foreground-500">불러오는 중...</p>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
          <p className="text-sm text-foreground-600">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      ) : recent.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-foreground-500">
          아직 이 게시판에 모인 글이 없어요. 위에서 AI 수집을 눌러 내용을 채워보세요.
        </p>
      ) : (
        <ul className="divide-y divide-background-200">
          {recent.map((post) => {
            const clickable = !post.id.startsWith('mock-');
            const inner = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground-900">
                    {post.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground-500">
                    <span className="inline-flex items-center gap-1">
                      <i className="ri-user-3-line" />
                      {post.author_name}
                    </span>
                    {post.location && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-foreground-300" />
                        <span className="inline-flex items-center gap-1">
                          <i className="ri-map-pin-line" />
                          {post.location}
                        </span>
                      </>
                    )}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-foreground-500">
                  <i className="ri-eye-line" />
                  {post.view_count}
                </span>
                <span className="shrink-0 whitespace-nowrap text-xs text-foreground-500">
                  {timeAgo(post.created_at)}
                </span>
              </>
            );

            return (
              <li key={post.id}>
                {clickable ? (
                  <Link
                    to={`/board/${hub.slug}/${post.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-background-100 cursor-pointer"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-3.5">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}