import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import RecordCard from '@/pages/room/components/RecordCard';
import RecordEditor from '@/pages/room/components/RecordEditor';
import RecordGridTile from '@/pages/room/components/RecordGridTile';
import RecordDetailModal from '@/pages/room/components/RecordDetailModal';
import UserAvatar from '@/components/feature/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useMyRecords } from '@/hooks/useRecords';
import { useSeo } from '@/hooks/useSeo';
import { BRAND_NAME } from '@/lib/seo';
import { useRoomVisits } from '@/hooks/useRoomVisits';
import type { PersonalRecord, RecordInput } from '@/lib/records';

type FilterKey = 'all' | 'public' | 'private' | 'shared';

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'all', label: '전체', icon: 'ri-apps-2-line' },
  { key: 'public', label: '공개', icon: 'ri-earth-line' },
  { key: 'private', label: '나만 보기', icon: 'ri-lock-line' },
  { key: 'shared', label: '게시판 공유', icon: 'ri-share-forward-line' },
];

type ViewKey = 'grid' | 'feed';

const VIEWS: { key: ViewKey; label: string; icon: string }[] = [
  { key: 'grid', label: '그리드', icon: 'ri-layout-grid-line' },
  { key: 'feed', label: '피드', icon: 'ri-article-line' },
];

export default function RoomPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { boards } = useBoards();
  const {
    records,
    loading,
    error,
    busyId,
    reload,
    createRecord,
    updateRecord,
    removeRecord,
    setVisibility,
    shareToBoard,
    unshareFromBoard,
  } = useMyRecords();
  const { uniqueVisitors } = useRoomVisits(profile?.id, true, user?.id ?? null);

  const [filter, setFilter] = useState<FilterKey>('all');
  const [view, setView] = useState<ViewKey>('grid');
  const [detail, setDetail] = useState<PersonalRecord | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useSeo(
    {
      title: `내 기록방 - ${BRAND_NAME}`,
      description:
        '나만의 작은 기록방에서 소소한 하루와 취미 기록을 남겨보세요. 원하는 기록만 공개하거나 게시판에 공유했다가 내릴 수 있어요.',
      keywords: '기록방, 미니홈피, 취미 일기, 개인 기록, 취미 자파리',
      path: '/room',
      robots: 'noindex, follow',
    },
    [],
  );

  const roomPath = profile?.username ? `/room/${profile.username}` : null;
  const roomUrl =
    roomPath && typeof window !== 'undefined' ? `${window.location.origin}${roomPath}` : '';
  const ownerName = profile?.nickname || profile?.username || profile?.name || '회원';

  const filtered = useMemo(() => {
    if (filter === 'public') return records.filter((r) => r.visibility === 'public');
    if (filter === 'private') return records.filter((r) => r.visibility === 'private');
    if (filter === 'shared') return records.filter((r) => Boolean(r.shared_post_id));
    return records;
  }, [records, filter]);

  const stats = useMemo(
    () => ({
      total: records.length,
      publicCount: records.filter((r) => r.visibility === 'public').length,
      sharedCount: records.filter((r) => r.shared_post_id).length,
    }),
    [records],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const openNew = () => {
    setEditing(null);
    setFormError(null);
    setEditorOpen(true);
  };

  const openEdit = (record: PersonalRecord) => {
    setEditing(record);
    setFormError(null);
    setEditorOpen(true);
  };

  const handleSubmit = async (input: RecordInput) => {
    setSubmitting(true);
    setFormError(null);
    const result = editing ? await updateRecord(editing, input) : await createRecord(input);
    setSubmitting(false);
    if (result) {
      setFormError(result);
      return;
    }
    setEditorOpen(false);
    setEditing(null);
    showToast(editing ? '기록을 수정했어요.' : '기록을 저장했어요.');
  };

  const handleToggleVisibility = async (record: PersonalRecord) => {
    const next = record.visibility === 'public' ? 'private' : 'public';
    const result = await setVisibility(record, next);
    if (result) {
      showToast(result);
      return;
    }
    setDetail((prev) => (prev && prev.id === record.id ? { ...prev, visibility: next } : prev));
    showToast(next === 'public' ? '공개로 바꿨어요. 이제 기록방에서 보여요.' : '나만 보기로 바꿨어요.');
  };

  const handleShare = async (record: PersonalRecord, boardId: string) => {
    const result = await shareToBoard(record, boardId);
    if (result) showToast(result);
    else showToast('게시판에 공유했어요.');
  };

  const handleUnshare = async (record: PersonalRecord) => {
    const result = await unshareFromBoard(record);
    if (result) showToast(result);
    else showToast('게시판에서 내렸어요. 기록방에는 그대로 남아 있어요.');
  };

  const handleDelete = async (record: PersonalRecord) => {
    const result = await removeRecord(record);
    if (result) showToast(result);
    else showToast('기록을 삭제했어요.');
  };

  const copyRoomUrl = async () => {
    if (!roomUrl) return;
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('주소를 복사하지 못했어요. 길게 눌러 복사해주세요.');
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background-50">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[640px] flex-1 items-center justify-center px-4">
          <p className="text-sm text-foreground-500">불러오는 중...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background-50">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
            <i className="ri-lock-line text-2xl" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold text-foreground-950">
            로그인이 필요해요
          </h1>
          <p className="mt-2 text-sm text-foreground-600">
            나만의 기록방은 로그인한 회원에게 하나씩 열려요.
          </p>
          <Link
            to="/auth"
            className="mt-6 whitespace-nowrap rounded-md bg-primary-500 px-6 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
          >
            로그인하기
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-8">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
          <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
            홈
          </Link>
          <i className="ri-arrow-right-s-line" />
          <span className="text-foreground-800">내 기록방</span>
        </nav>

        <section className="overflow-hidden rounded-lg border border-background-200 bg-accent-100/50">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="min-w-0">
              <p className="text-xs font-label uppercase tracking-[0.2em] text-accent-700">
                MY LITTLE ROOM
              </p>
              <div className="mt-2 flex items-center gap-3">
                <UserAvatar
                  src={profile?.avatar_url}
                  name={profile?.nickname || profile?.username || '회원'}
                  sizeClass="h-14 w-14"
                />
                <h1 className="font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
                  {profile?.nickname || profile?.username || profile?.name || '회원'}님의 기록방
                </h1>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground-700">
                여기는 나만 보는 작은 기록방이에요. 오늘 있었던 일, 취미로 한 것들을 부담 없이
                적어두고, 마음에 드는 기록만 공개하거나 게시판에 올렸다 내렸다 해보세요.
              </p>

              {roomPath && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="flex min-w-0 items-center gap-2 rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs text-foreground-700">
                    <i className="ri-link" />
                    <span className="truncate">{roomUrl}</span>
                  </span>
                  <button
                    type="button"
                    onClick={copyRoomUrl}
                    className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-medium text-foreground-800 transition-colors hover:border-primary-300 hover:text-primary-700 cursor-pointer"
                  >
                    <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} />
                    {copied ? '복사됨' : '내 기록방 주소 복사'}
                  </button>
                  <Link
                    to={roomPath}
                    className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-medium text-foreground-800 transition-colors hover:border-primary-300 hover:text-primary-700 cursor-pointer"
                  >
                    <i className="ri-eye-line" />
                    공개된 모습 보기
                  </Link>
                </div>
              )}
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="전체 기록" value={stats.total} icon="ri-book-2-line" />
              <StatBox label="공개" value={stats.publicCount} icon="ri-earth-line" tone="accent" />
              <StatBox label="공유 중" value={stats.sharedCount} icon="ri-share-forward-line" tone="secondary" />
              <StatBox label="방문자" value={uniqueVisitors} icon="ri-eye-line" tone="accent" />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'border-foreground-900 bg-foreground-900 text-background-50'
                        : 'border-background-300 bg-background-50 text-foreground-700 hover:border-foreground-400'
                    }`}
                  >
                    <i className={`${f.icon} text-base`} />
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                <i className="ri-add-line" />
                오늘의 기록 쓰기
              </button>
            </div>
          </div>

          {loading ? (
            <RoomGridSkeleton view={view} />
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <i className="ri-quill-pen-line text-2xl" />
              </span>
              <p className="mt-4 font-heading text-base font-semibold text-foreground-800">
                {records.length === 0 ? '아직 기록이 없어요' : '이 조건에 맞는 기록이 없어요'}
              </p>
              <p className="mt-1 text-xs text-foreground-500">
                {records.length === 0
                  ? '오늘의 소소한 순간 하나부터 적어볼까요?'
                  : '다른 필터를 눌러보세요.'}
              </p>
              {records.length === 0 && (
                <button
                  type="button"
                  onClick={openNew}
                  className="mt-5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
                >
                  <i className="ri-add-line" />
                  첫 기록 남기기
                </button>
              )}
            </div>
          ) : (
            view === 'grid' ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                {filtered.map((record) => (
                  <RecordGridTile key={record.id} record={record} onOpen={setDetail} />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-[720px] space-y-4">
                {filtered.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    boards={boards}
                    busy={busyId === record.id}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                    onShare={handleShare}
                    onUnshare={handleUnshare}
                  />
                ))}
              </div>
            )
          )}
        </section>
      </main>

      <RecordEditor
        open={editorOpen}
        initial={editing}
        userId={user.id}
        submitting={submitting}
        error={formError}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <RecordDetailModal
        record={detail}
        ownerName={ownerName}
        ownerUsername={profile?.username}
        busy={detail ? busyId === detail.id : false}
        onClose={() => setDetail(null)}
        onEdit={(record) => {
          setDetail(null);
          openEdit(record);
        }}
        onDelete={handleDelete}
        onToggleVisibility={handleToggleVisibility}
      />

      {toast && (
        <div className="fixed inset-x-0 bottom-20 z-[80] flex justify-center px-4 lg:bottom-8">
          <div className="flex items-center gap-2 rounded-full bg-foreground-950 px-4 py-2.5 text-xs font-medium text-background-50">
            <i className="ri-checkbox-circle-line text-base" />
            {toast}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string;
  value: number;
  icon: string;
  tone?: 'default' | 'accent' | 'secondary';
}) {
  const toneClass =
    tone === 'accent'
      ? 'text-accent-700'
      : tone === 'secondary'
        ? 'text-secondary-800'
        : 'text-foreground-700';
  return (
    <div className="rounded-lg border border-background-200 bg-background-50 px-3 py-3 text-center">
      <span className={`flex items-center justify-center ${toneClass}`}>
        <i className={`${icon} text-lg`} />
      </span>
      <p className="mt-1 font-heading text-xl font-bold text-foreground-950">{value}</p>
      <p className="text-[11px] text-foreground-500">{label}</p>
    </div>
  );
}

function RoomGridSkeleton({ view }: { view: 'grid' | 'feed' }) {
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="aspect-square animate-pulse rounded-lg bg-background-100" />
        ))}
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[720px] space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[260px] animate-pulse rounded-lg bg-background-100" />
      ))}
    </div>
  );
}