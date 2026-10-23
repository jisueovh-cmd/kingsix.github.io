import { Link } from 'react-router-dom';
import type { Member } from '@/hooks/useMembers';

export default function PeopleCard({ member }: { member: Member }) {
  const roomTo = member.username ? `/room/${member.username}` : null;
  const initial = (member.name || '회원').charAt(0);

  const inner = (
    <>
      <div className="flex items-center gap-3.5 md:gap-4">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name}
            className="h-14 w-14 rounded-full object-cover object-top md:h-16 md:w-16"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-100 font-heading text-lg font-bold text-secondary-700 md:h-16 md:w-16">
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-heading text-base font-bold text-foreground-900 md:text-lg">
            {member.name}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-label text-accent-800">
            취미 기록자
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-background-100 pt-3 md:pt-4">
        <span className="flex items-center gap-1.5 text-xs text-foreground-500">
          <i className="ri-file-text-line" />
          {member.post_count > 0 ? `${member.post_count}개의 글` : '새로운 얼굴'}
        </span>
        {roomTo && (
          <span className="flex items-center gap-1 text-xs text-primary-600">
            기록방
            <i className="ri-arrow-right-s-line" />
          </span>
        )}
      </div>
    </>
  );

  if (roomTo) {
    return (
      <Link
        to={roomTo}
        className="group block rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-300 md:p-6 cursor-pointer"
      >
        {inner}
      </Link>
    );
  }

  return (
    <article className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-6">
      {inner}
    </article>
  );
}