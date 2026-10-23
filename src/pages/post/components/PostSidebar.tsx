import { Link } from 'react-router-dom';
import type { Board } from '@/types/home';

interface PostSidebarProps {
  boards: Board[];
  currentSlug: string | undefined;
}

export default function PostSidebar({ boards, currentSlug }: PostSidebarProps) {
  return (
    <aside className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
        <div className="border-b border-background-200 bg-background-100/70 px-4 py-3">
          <h3 className="font-heading text-sm font-bold text-foreground-950">다른 게시판</h3>
        </div>
        <nav className="flex flex-col p-2">
          {boards.map((board) => {
            const active = board.slug === currentSlug;
            return (
              <Link
                key={board.slug}
                to={`/board/${board.slug}`}
                className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                  active
                    ? 'bg-primary-100 font-semibold text-primary-800'
                    : 'text-foreground-700 hover:bg-background-100 hover:text-primary-700'
                }`}
              >
                <i className={`text-base ${active ? 'ri-folder-open-line' : 'ri-folder-line text-foreground-400'}`} />
                {board.name}
              </Link>
            );
          })}
        </nav>
      </section>

      <section className="rounded-lg border border-secondary-200 bg-secondary-100/60 p-4">
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground-950">
          <i className="ri-chat-3-line text-secondary-600" />
          댓글 준비 중
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-foreground-700">
          이 글에 댓글을 남기는 기능을 곧 열 예정이에요. 조금만 기다려주세요!
        </p>
      </section>
    </aside>
  );
}