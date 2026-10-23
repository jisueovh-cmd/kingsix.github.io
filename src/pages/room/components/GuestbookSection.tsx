import { useState } from 'react';
import type { FormEvent } from 'react';
import type { GuestbookEntry, GuestbookInput } from '@/lib/records';
import { GUESTBOOK_MAX_LENGTH, GUESTBOOK_NAME_MAX_LENGTH, guestbookName } from '@/lib/records';
import { timeAgo } from '@/lib/format';

interface GuestbookSectionProps {
  ownerId: string;
  ownerName: string;
  entries: GuestbookEntry[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  busyId: string | null;
  canWrite: boolean;
  viewerId: string | null;
  defaultName: string;
  onSubmit: (input: GuestbookInput) => Promise<string | null>;
  onDelete: (id: string) => Promise<string | null>;
  onRetry: () => void;
}

/**
 * 공개 기록방 방명록. 로그인 없이도 이름을 골라 흔적을 남길 수 있고,
 * 방 주인과 글쓴 본인은 남긴 글을 지울 수 있다.
 */
export default function GuestbookSection({
  ownerId,
  ownerName,
  entries,
  loading,
  error,
  submitting,
  busyId,
  canWrite,
  viewerId,
  defaultName,
  onSubmit,
  onDelete,
  onRetry,
}: GuestbookSectionProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await onSubmit({ name, content });
    if (result) {
      setFormError(result);
      return;
    }
    setFormError(null);
    setContent('');
  };

  const handleDelete = async (id: string) => {
    setConfirmId(null);
    await onDelete(id);
  };

  const canDelete = (entry: GuestbookEntry) =>
    Boolean(viewerId && (viewerId === ownerId || viewerId === entry.author_id));

  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-background-200 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100 text-secondary-800">
            <i className="ri-book-marked-line text-lg" />
          </span>
          <div>
            <h2 className="font-heading text-base font-bold text-foreground-950">방명록</h2>
            <p className="text-xs text-foreground-500">
              {ownerName}님의 기록방에 다녀간 흔적을 남겨보세요
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-background-100 px-3 py-1 text-xs font-medium text-foreground-700">
          <i className="ri-chat-3-line" />
          {entries.length}개
        </span>
      </div>

      {canWrite ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={GUESTBOOK_NAME_MAX_LENGTH}
              placeholder="이름 (선택 · 비우면 익명)"
              className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm text-foreground-800 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none sm:w-64"
            />
            <span className="flex items-center gap-1 text-xs text-foreground-400">
              <i className="ri-information-line text-sm" />
              로그인 없이도 남길 수 있어요
            </span>
          </div>

          <div className="mt-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={GUESTBOOK_MAX_LENGTH}
              rows={3}
              placeholder="따뜻한 한마디 남겨주세요 (최대 300자)"
              className="w-full resize-none rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm leading-relaxed text-foreground-800 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none"
            />
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span className="text-[11px] text-foreground-400">
                {content.length}/{GUESTBOOK_MAX_LENGTH}
              </span>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <i className="ri-send-plane-line" />
                {submitting ? '남기는 중...' : '방명록 남기기'}
              </button>
            </div>
          </div>

          {formError && (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-primary-700">
              <i className="ri-error-warning-line text-sm" />
              {formError}
            </p>
          )}
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-4 py-3 text-xs text-accent-800">
          <i className="ri-user-star-line text-base" />
          내 기록방이에요. 남겨진 방명록은 여기서 바로 지울 수 있어요.
        </div>
      )}

      {loading ? (
        <ul className="mt-4 space-y-2.5">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[84px] animate-pulse rounded-lg bg-background-100" />
          ))}
        </ul>
      ) : error ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs text-primary-800">
            <i className="ri-error-warning-line text-base" />
            {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-secondary-800">
            <i className="ri-quill-pen-line text-xl" />
          </span>
          <p className="mt-3 font-heading text-sm font-semibold text-foreground-800">
            아직 방명록이 없어요
          </p>
          <p className="mt-1 text-xs text-foreground-500">
            {canWrite ? '첫 번째 흔적을 남겨보세요.' : '아직 아무도 다녀가지 않았어요.'}
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {entries.map((entry) => {
            const label = guestbookName(entry);
            const initial = label.slice(0, 1);
            const deletable = canDelete(entry);
            const busy = busyId === entry.id;
            return (
              <li
                key={entry.id}
                className="flex gap-3 rounded-lg border border-background-200 bg-background-50 p-3.5 md:p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-100 font-heading text-sm font-bold text-secondary-800">
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading text-sm font-bold text-foreground-950">
                      {label}
                    </span>
                    {entry.author_id && entry.author_id === ownerId && (
                      <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-medium text-accent-800">
                        주인
                      </span>
                    )}
                    <span className="text-[11px] text-foreground-400">
                      {timeAgo(entry.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-relaxed text-foreground-700">
                    {entry.content}
                  </p>
                </div>

                {deletable &&
                  (confirmId === entry.id ? (
                    <div className="flex shrink-0 items-start gap-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(entry.id)}
                        className="whitespace-nowrap rounded-md bg-primary-500 px-2.5 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:opacity-50 cursor-pointer"
                      >
                        삭제
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="whitespace-nowrap rounded-md border border-background-300 px-2.5 py-1.5 text-[11px] text-foreground-600 transition-colors hover:bg-background-100 cursor-pointer"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(entry.id)}
                      aria-label="방명록 삭제"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-background-300 text-foreground-500 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-sm" />
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}