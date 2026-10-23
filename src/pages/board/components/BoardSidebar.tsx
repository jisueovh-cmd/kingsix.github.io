import { Link } from 'react-router-dom';
import type { Board } from '@/types/home';

interface BoardSidebarProps {
  boards: Board[];
  currentSlug: string | undefined;
}

export default function BoardSidebar({ boards, currentSlug }: BoardSidebarProps) {
  return (
    <aside className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
        <div className="border-b border-background-200 bg-background-100/70 px-4 py-3">
          <h3 className="font-heading text-sm font-bold text-foreground-950">게시판 모음</h3>
        </div>
        <nav className="flex flex-col p-2">
          {boards.map((board) => {
            const active = board.slug === currentSlug;
            return (
              <Link
                key={board.slug}
                to={`/board/${board.slug}`}
                className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                  active
                    ? 'bg-primary-100 font-semibold text-primary-800'
                    : 'text-foreground-700 hover:bg-background-100 hover:text-primary-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <i
                    className={`text-base ${
                      active ? 'ri-folder-open-line' : 'ri-folder-line text-foreground-400'
                    }`}
                  />
                  {board.name}
                </span>
                {active && <i className="ri-arrow-right-s-line" />}
              </Link>
            );
          })}
        </nav>
      </section>

      <section className="rounded-lg border border-accent-200 bg-accent-100/60 p-4">
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground-950">
          <i className="ri-megaphone-line text-accent-600" />
          운영 안내
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-foreground-700">
          따뜻한 이야기만 나눠주세요. 서로를 배려하는 댓글은 자파리의 큰 힘이 됩니다.
        </p>
        <Link
          to="/"
          className="mt-3 inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-primary-700 transition-colors hover:text-primary-800 cursor-pointer"
        >
          홈으로 가기
          <i className="ri-arrow-right-line" />
        </Link>
      </section>
    </aside>
  );
}