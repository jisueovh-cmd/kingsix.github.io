import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import RecordCard from '@/pages/room/components/RecordCard';
import RecordGridTile from '@/pages/room/components/RecordGridTile';
import RecordDetailModal from '@/pages/room/components/RecordDetailModal';
import GuestbookSection from '@/pages/room/components/GuestbookSection';
import UserAvatar from '@/components/feature/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useRoomRecords } from '@/hooks/useRecords';
import { useGuestbook } from '@/hooks/useGuestbook';
import { useRoomVisits } from '@/hooks/useRoomVisits';
import { useSeo } from '@/hooks/useSeo';
import { BRAND_NAME } from '@/lib/seo';
import type { PersonalRecord } from '@/lib/records';

type ViewKey = 'grid' | 'feed';

const VIEWS: { key: ViewKey; label: string; icon: string }[] = [
  { key: 'grid', label: '그리드', icon: 'ri-layout-grid-line' },
  { key: 'feed', label: '피드', icon: 'ri-article-line' },
];

export default function VisitRoomPage() {
  const { username } = useParams<{ username: string }>();
  const { user, profile } = useAuth();
  const { profile: owner, records, loading, error, notFound, reload } = useRoomRecords(username);
  const [view, setView] = useState<ViewKey>('grid');
  const [detail, setDetail] = useState<PersonalRecord | null>(null);

  const ownerName = owner?.nickname || owner?.username || '회원';
  const isMine = Boolean(user && owner && user.id === owner.id);

  const guestbook = useGuestbook(owner?.id);
  const { uniqueVisitors } = useRoomVisits(owner?.id, isMine, user?.id ?? null);

  useSeo(
    {
      title: `${ownerName}님의 기록방 - ${BRAND_NAME}`,
      description: `${ownerName}님이 공개로 남긴 취미와 일상 기록을 인스타그램 피드처럼 모아둔 기록방이에요.`,
      keywords: '기록방, 미니홈피, 취미 기록, 개인 블로그',
      path: username ? `/room/${username}` : null,
      robots: 'noindex, follow',
    },
    [ownerName, username],
  );

  const startedAt = owner?.created_at
    ? new Date(owner.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
    : '';

  const stats = useMemo(
    () => ({
      posts: records.length,
      shared: records.filter((r) => r.shared_post_id).length,
      photos: records.filter((r) => r.images && r.images.length > 0).length,
    }),
    [records],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 py-6 md:px-6 md:py-8">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
          <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
            홈
          </Link>
          <i className="ri-arrow-right-s-line" />
          <Link to="/room" className="transition-colors hover:text-primary-700 cursor-pointer">
            기록방
          </Link>
          <i className="ri-arrow-right-s-line" />
          <span className="text-foreground-800">{ownerName}님의 기록방</span>
        </nav>

        {loading ? (
          <div className="space-y-6">
            <div className="h-[180px] animate-pulse rounded-lg bg-background-100" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-background-100" />
              ))}
            </div>
          </div>
        ) : notFound ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-24 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-emotion-sad-line text-2xl" />
            </span>
            <p className="mt-4 font-heading text-lg font-bold text-foreground-900">
              아직 없는 기록방이에요
            </p>
            <p className="mt-1 text-sm text-foreground-500">
              주소를 다시 확인하거나, 나만의 기록방을 만들어보세요.
            </p>
            <Link
              to="/room"
              className="mt-6 whitespace-nowrap rounded-md bg-primary-500 px-6 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              내 기록방 가기
            </Link>
          </div>
        ) : error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-primary-800">
              <i className="ri-error-warning-line text-base" />
              {error}
            </p>
            <button
              type="button"
              onClick={reload}
              className="whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            {/* 인스타그램 프로필 헤더 */}
            <section className="rounded-lg border border-background-200 bg-background-50 p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-12">
                <UserAvatar
                  src={owner?.avatar_url}
                  name={ownerName}
                  sizeClass="h-20 w-20 md:h-28 md:w-28"
                  className="border-2 border-accent-300"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-heading text-xl font-bold text-foreground-950 md:text-2xl">
                      {owner?.username || ownerName}
                    </h1>
                    <span className="rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-medium text-accent-800">
                      공개 기록방
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
                    <ProfileStat value={stats.posts} label="게시물" />
                    <ProfileStat value={uniqueVisitors} label="방문자" />
                    <ProfileStat value={stats.shared} label="게시판 공유" />
                    <ProfileStat value={stats.photos} label="사진 기록" />
                  </div>

                  <div className="mt-4">
                    <p className="font-heading text-sm font-bold text-foreground-950">{ownerName}</p>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-foreground-600">
                      {ownerName}님이 공개로 남긴 취미와 일상 기록이에요. 게시판에도 공유한 기록은
                      게시판에서도 만날 수 있어요. {startedAt && `함께한 지는 ${startedAt}부터.`}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                    {isMine ? (
                      <Link
                        to="/room"
                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
                      >
                        <i className="ri-edit-line" />
                        내 기록방 관리
                      </Link>
                    ) : (
                      <Link
                        to={user ? '/room' : '/auth'}
                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
                      >
                        <i className="ri-add-line" />
                        나도 기록방 만들기
                      </Link>
                    )}
                    <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-xs text-foreground-600">
                      <i className="ri-shield-check-line" />
                      공개로 둔 기록만 보여요
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 그리드 / 피드 전환 */}
            <section className="mt-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-background-200 pb-3">
                <div className="inline-flex rounded-full bg-background-200/70 p-1">
                  {VIEWS.map((v) => {
                    const active = view === v.key;
                    return (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => setView(v.key)}
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? 'bg-background-50 text-foreground-900'
                            : 'text-foreground-600 hover:text-foreground-800'
                        }`}
                      >
                        <i className={`${v.icon} text-base`} />
                        {v.label}
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-foreground-500">
                  공개 기록 <span className="font-semibold text-foreground-800">{records.length}</span>개
                </p>
              </div>

              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-20 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                    <i className="ri-lock-line text-2xl" />
                  </span>
                  <p className="mt-4 font-heading text-base font-semibold text-foreground-800">
                    아직 공개된 기록이 없어요
                  </p>
                  <p className="mt-1 text-xs text-foreground-500">
                    {ownerName}님이 아직 공개로 둔 기록이 없어요. 조금 뒤에 다시 들러보세요.
                  </p>
                </div>
              ) : view === 'grid' ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                  {records.map((record) => (
                    <RecordGridTile key={record.id} record={record} onOpen={setDetail} />
                  ))}
                </div>
              ) : (
                <div className="mx-auto max-w-[620px] space-y-4">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setDetail(record)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDetail(record);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <RecordCard record={record} readOnly />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {owner && (
              <GuestbookSection
                ownerId={owner.id}
                ownerName={ownerName}
                entries={guestbook.entries}
                loading={guestbook.loading}
                error={guestbook.error}
                submitting={guestbook.submitting}
                busyId={guestbook.busyId}
                canWrite={!isMine}
                viewerId={user?.id ?? null}
                defaultName={profile?.nickname || profile?.username || ''}
                onSubmit={guestbook.addEntry}
                onDelete={guestbook.removeEntry}
                onRetry={guestbook.reload}
              />
            )}

            {!isMine && (
              <p className="mt-10 text-center text-xs text-foreground-400">
                {ownerName}님의 기록방이었어요. 기록마다 공개/비공개를 주인이 직접 고르기 때문에,
                여기에는 공개로 둔 기록만 보여요.
              </p>
            )}
          </>
        )}
      </main>

      <RecordDetailModal
        record={detail}
        ownerName={ownerName}
        ownerUsername={owner?.username}
        onClose={() => setDetail(null)}
      />

      <SiteFooter />
    </div>
  );
}

function ProfileStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center md:text-left">
      <p className="font-heading text-xl font-bold text-foreground-950 md:text-2xl">{value}</p>
      <p className="text-[11px] text-foreground-500 md:text-xs">{label}</p>
    </div>
  );
}