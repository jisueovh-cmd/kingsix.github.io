import { Link } from 'react-router-dom';
import { useBoards } from '@/hooks/useBoards';
import { sortUserBoards } from '@/lib/boards';
import UserBoardCard from '@/components/feature/UserBoardCard';

export default function UserBoardsSection() {
  const { boards, loading } = useBoards();
  const userBoards = sortUserBoards(boards);

  // 로딩이 끝났는데 회원이 만든 게시판이 하나도 없으면 안내 카드만 보여준다.
  const showEmpty = !loading && userBoards.length === 0;

  return (
    <section id="member-boards">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-label uppercase tracking-[0.2em] text-secondary-700">
            MADE BY MEMBERS
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            회원들이 만든 게시판
          </h2>
          <p className="mt-1.5 text-xs text-foreground-600 md:text-sm">
            누구나 나만의 주제로 게시판을 열 수 있어요 &mdash; 새로 만들어진 방을 구경해보세요
          </p>
        </div>
        <Link
          to="/boards#user-boards"
          className="hidden items-center gap-1 whitespace-nowrap text-sm text-foreground-600 transition-colors hover:text-secondary-800 sm:flex cursor-pointer"
        >
          게시판 모음 보기
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      {showEmpty ? (
        <Link
          to="/boards"
          className="group flex flex-col items-center justify-center rounded-lg border border-dashed border-secondary-300 bg-secondary-50/60 px-6 py-12 text-center transition-colors hover:border-secondary-400 cursor-pointer"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-100 text-secondary-800">
            <i className="ri-add-circle-line text-2xl" />
          </span>
          <p className="mt-4 font-heading text-base font-bold text-foreground-950">
            아직 회원이 만든 게시판이 없어요
          </p>
          <p className="mt-1 text-sm text-foreground-600">
            첫 번째 게시판의 주인이 되어보세요.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-secondary-500 px-5 py-2.5 text-sm font-medium text-background-50 transition-colors group-hover:bg-secondary-600">
            <i className="ri-add-line" />
            게시판 만들기
          </span>
        </Link>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userBoards.map((board) => (
            <UserBoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </section>
  );
}