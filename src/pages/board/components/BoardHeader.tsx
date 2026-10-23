import { Link } from 'react-router-dom';
import type { Board } from '@/types/home';

interface BoardHeaderProps {
  board: Board | null;
  total: number;
  canManage?: boolean;
  onManage?: () => void;
}

export default function BoardHeader({ board, total, canManage, onManage }: BoardHeaderProps) {
  const cover = board?.cover_image ?? '';

  return (
    <section className="overflow-hidden rounded-lg border border-background-200 bg-background-100">
      <div className="relative h-[200px] w-full md:h-[240px]">
        {cover && (
          <img
            src={cover}
            alt={board?.name ?? '게시판'}
            className="h-full w-full object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/85 via-foreground-950/45 to-foreground-950/20" />
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-background-100/80">
            <Link to="/" className="transition-colors hover:text-background-50 cursor-pointer">
              홈
            </Link>
            <i className="ri-arrow-right-s-line" />
            <span className="text-background-50">{board?.name ?? '게시판'}</span>
          </nav>
          <h1 className="font-heading text-2xl font-bold text-background-50 md:text-3xl">
            {board?.name ?? '게시판'}
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-background-100/90 md:text-sm">
            {board?.description ?? '이야기를 나눠보세요.'}
          </p>
        </div>
        <div className="absolute right-4 top-4 flex flex-wrap items-center justify-end gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-background-50/90 px-3 py-1 text-xs font-medium text-foreground-800">
            <i className="ri-file-list-3-line text-primary-600" />
            {total}개의 글
          </span>
          {canManage && onManage && (
            <button
              type="button"
              onClick={onManage}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary-500 px-3 py-1 text-xs font-semibold text-background-50 transition-colors hover:bg-secondary-600 cursor-pointer"
            >
              <i className="ri-settings-3-line text-sm" />
              게시판 관리
            </button>
          )}
        </div>
      </div>
    </section>
  );
}