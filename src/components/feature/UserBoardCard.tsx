import { Link } from 'react-router-dom';
import { DEFAULT_BOARD_ICON } from '@/lib/boards';
import type { Board } from '@/types/home';

interface UserBoardCardProps {
  board: Board;
}

export default function UserBoardCard({ board }: UserBoardCardProps) {
  const icon = board.icon || DEFAULT_BOARD_ICON;
  return (
    <Link
      to={`/board/${board.slug}`}
      className="group flex items-center gap-4 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-secondary-300 md:p-5 cursor-pointer"
    >
      {board.cover_image ? (
        <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          <img
            src={board.cover_image}
            alt={board.name}
            className="h-full w-full object-cover object-top"
          />
        </span>
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-secondary-800">
          <i className={`${icon} text-xl`} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-heading text-base font-bold text-foreground-900 transition-colors group-hover:text-secondary-800">
            {board.name}
          </h3>
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-label text-secondary-800">
            <i className="ri-user-line" />
            회원 개설
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-foreground-500">
          {board.description ?? '새로 열린 게시판이에요.'}
        </p>
      </div>
      <i className="ri-arrow-right-s-line shrink-0 text-xl text-foreground-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-secondary-700" />
    </Link>
  );
}