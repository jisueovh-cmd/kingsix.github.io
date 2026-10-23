import type { BoardSort } from '@/hooks/useBoardPosts';

const SORT_OPTIONS: { value: BoardSort; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'trending', label: '트렌딩' },
];

interface FeedControlsProps {
  sort: BoardSort;
  onSortChange: (sort: BoardSort) => void;
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export default function FeedControls({
  sort,
  onSortChange,
  tags,
  activeTag,
  onTagChange,
}: FeedControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-full border border-background-200 bg-background-100 p-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSortChange(opt.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                sort === opt.value
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-600 hover:text-foreground-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="hidden text-xs text-foreground-500 sm:block">
          취향에 맞는 글을 골라보세요
        </span>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onTagChange(null)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTag === null
                ? 'bg-accent-500 text-background-50'
                : 'border border-background-200 text-foreground-600 hover:bg-background-100'
            }`}
          >
            전체
          </button>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTagChange(activeTag === t ? null : t)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeTag === t
                  ? 'bg-accent-500 text-background-50'
                  : 'border border-background-200 text-foreground-600 hover:bg-background-100'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}