interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function buildPages(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-5 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="이전 페이지"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-background-300 text-foreground-600 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <i className="ri-arrow-left-s-line text-lg" />
      </button>

      {buildPages(page, totalPages).map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-1 text-foreground-400">
            ···
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`h-9 min-w-9 rounded-md px-2 text-sm font-medium transition-colors cursor-pointer ${
              item === page
                ? 'bg-primary-500 text-background-50'
                : 'border border-background-300 text-foreground-700 hover:bg-background-100'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="다음 페이지"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-background-300 text-foreground-600 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <i className="ri-arrow-right-s-line text-lg" />
      </button>
    </nav>
  );
}