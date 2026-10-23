import { Link } from 'react-router-dom';
import type { SmallTalkMessage } from '@/types/home';
import SmallTalk from '@/pages/home/components/SmallTalk';
import PeopleCard from '@/pages/people/components/PeopleCard';
import { useMembers } from '@/hooks/useMembers';

interface CommunitySectionProps {
  messages: SmallTalkMessage[];
  onSend: (nickname: string, content: string) => Promise<boolean>;
}

export default function CommunitySection({ messages, onSend }: CommunitySectionProps) {
  const { members, loading } = useMembers(8);

  return (
    <section id="community">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-label uppercase tracking-[0.2em] text-primary-600">
            COMMUNITY
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            함께하는 사람들
          </h2>
        </div>
        <Link
          to="/people"
          className="hidden items-center gap-1 whitespace-nowrap text-sm text-foreground-600 transition-colors hover:text-primary-700 sm:flex cursor-pointer"
        >
          모두 보기
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[128px] animate-pulse rounded-lg bg-background-100" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-background-300 bg-background-50 px-6 py-14 text-center">
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

        <SmallTalk messages={messages} onSend={onSend} />
      </div>
    </section>
  );
}