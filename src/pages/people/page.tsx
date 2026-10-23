import { Link } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import SmallTalk from '@/pages/home/components/SmallTalk';
import PeopleMobileView from '@/pages/people/components/PeopleMobileView';
import PeopleCard from '@/pages/people/components/PeopleCard';
import { useHomeData } from '@/hooks/useHomeData';
import { useMembers } from '@/hooks/useMembers';

export default function PeoplePage() {
  const { smallTalk, sendSmallTalk } = useHomeData();
  const { members, loading } = useMembers();

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      {/* 모바일: 앱처럼 꽉 찬 실시간 채팅 뷰 (하단 탭에서 바로 진입) */}
      <div className="lg:hidden">
        <PeopleMobileView people={members} loading={loading} messages={smallTalk} onSend={sendSmallTalk} />
      </div>

      {/* 데스크톱 */}
      <main className="mx-auto hidden w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-10 lg:block">
        <div className="mb-6">
          <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
            <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
              홈
            </Link>
            <i className="ri-arrow-right-s-line" />
            <span className="text-foreground-800">커뮤니티</span>
          </nav>
          <h1 className="font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            함께하는 사람들
          </h1>
          <p className="mt-1 text-sm text-foreground-600">
            취미로 연결된 사람들의 이야기를 만나보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[150px] animate-pulse rounded-lg bg-background-100" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-background-300 bg-background-50 px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <i className="ri-user-smile-line text-2xl" />
              </span>
              <p className="mt-4 font-heading text-base font-semibold text-foreground-800">
                아직 함께하는 분이 없어요
              </p>
              <p className="mt-1 text-xs text-foreground-500">
                이곳의 첫 주인공이 되어보세요. 가입하고 취미 이야기를 나눠보아요.
              </p>
              <Link
                to="/auth"
                className="mt-5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                <i className="ri-user-add-line" />
                함께 시작하기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {members.map((member) => (
                <PeopleCard key={member.id} member={member} />
              ))}
            </div>
          )}

          <SmallTalk messages={smallTalk} onSend={sendSmallTalk} />
        </div>

        <section className="mt-12 rounded-lg bg-accent-100/60 p-8 text-center">
          <h2 className="font-heading text-xl font-bold text-foreground-950">
            여러분도 이곳의 주인공이 되어보세요
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground-700">
            글을 남기고, 다른 사람의 취미에 응원을 보내며 함께 성장해요.
          </p>
          <Link
            to="/write"
            className="mt-5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-6 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
          >
            <i className="ri-edit-line" />
            첫 글 남기기
          </Link>
        </section>
      </main>

      <div className="hidden lg:block">
        <SiteFooter />
      </div>
    </div>
  );
}