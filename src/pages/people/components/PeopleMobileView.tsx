import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SmallTalkMessage } from '@/types/home';
import type { Member } from '@/hooks/useMembers';
import PeopleChat from '@/pages/people/components/PeopleChat';
import PeopleCard from '@/pages/people/components/PeopleCard';

interface PeopleMobileViewProps {
  people: Member[];
  loading?: boolean;
  messages: SmallTalkMessage[];
  onSend: (nickname: string, content: string) => Promise<boolean>;
}

type TabKey = 'chat' | 'people';

export default function PeopleMobileView({ people, loading, messages, onSend }: PeopleMobileViewProps) {
  const [tab, setTab] = useState<TabKey>('chat');

  return (
    <div
      className="flex flex-col overflow-hidden border-b border-background-200"
      style={{ height: 'calc(100dvh - 68px - 4rem - env(safe-area-inset-bottom))' }}
    >
      <div className="shrink-0 border-b border-background-200 bg-background-50 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-bold text-foreground-950">사람들</h2>
            <p className="mt-0.5 truncate text-xs text-foreground-500">
              취미로 연결된 사람들의 실시간 이야기
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-label tracking-wide text-accent-50">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-50" />
            LIVE
          </span>
        </div>

        <div className="mt-3 flex rounded-full bg-background-100 px-1 py-1">
          <button
            type="button"
            onClick={() => setTab('chat')}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full py-2 text-sm font-medium transition-colors cursor-pointer ${
              tab === 'chat' ? 'bg-background-50 text-primary-700' : 'text-foreground-500'
            }`}
          >
            <i className="ri-chat-smile-2-line text-base" />
            채팅
          </button>
          <button
            type="button"
            onClick={() => setTab('people')}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full py-2 text-sm font-medium transition-colors cursor-pointer ${
              tab === 'people' ? 'bg-background-50 text-primary-700' : 'text-foreground-500'
            }`}
          >
            <i className="ri-group-line text-base" />
            사람들
          </button>
        </div>
      </div>

      {tab === 'chat' ? (
        <PeopleChat messages={messages} onSend={onSend} />
      ) : loading ? (
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[120px] animate-pulse rounded-lg bg-background-100" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
            <i className="ri-user-smile-line text-2xl" />
          </span>
          <p className="mt-4 font-heading text-base font-semibold text-foreground-800">
            아직 함께하는 분이 없어요
          </p>
          <p className="mt-1 text-xs text-foreground-500">
            이곳의 첫 주인공이 되어보세요.
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
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {people.map((member) => (
              <PeopleCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}