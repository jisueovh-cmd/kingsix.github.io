import { useEffect, useState } from 'react';
import type { PersonalRecord } from '@/lib/records';
import { formatRecordDate, getMood } from '@/lib/records';

interface RecordDetailModalProps {
  record: PersonalRecord | null;
  ownerName: string;
  ownerUsername?: string | null;
  busy?: boolean;
  onClose: () => void;
  onEdit?: (record: PersonalRecord) => void;
  onDelete?: (record: PersonalRecord) => void;
  onToggleVisibility?: (record: PersonalRecord) => void;
}

/** 인스타그램 게시물처럼 기록 하나를 크게 펼쳐 보는 모달. */
export default function RecordDetailModal({
  record,
  ownerName,
  ownerUsername,
  busy,
  onClose,
  onEdit,
  onDelete,
  onToggleVisibility,
}: RecordDetailModalProps) {
  const [active, setActive] = useState(0);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setActive(0);
    setConfirming(false);
  }, [record]);

  useEffect(() => {
    if (!record) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirming) setConfirming(false);
        else onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [record, onClose, confirming]);

  if (!record) return null;

  const handleConfirmDelete = () => {
    onDelete?.(record);
    setConfirming(false);
    onClose();
  };

  const mood = getMood(record.mood);
  const images = Array.isArray(record.images) ? record.images : [];
  const hasImages = images.length > 0;
  const isPublic = record.visibility === 'public';
  const current = hasImages ? images[Math.min(active, images.length - 1)] : null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-foreground-950/70 px-4 py-6 md:items-center md:py-10"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[620px] overflow-hidden rounded-lg border border-background-200 bg-background-50"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-background-200 px-4 py-3 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-500 text-accent-50">
              <i className="ri-user-smile-line text-lg" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-foreground-950">{ownerName}</p>
              {ownerUsername && (
                <p className="truncate text-[11px] text-foreground-500">@{ownerUsername}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(record)}
                aria-label="기록 수정"
                className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-background-100 cursor-pointer"
              >
                <i className="ri-pencil-line text-lg" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming(true)}
                aria-label="기록 삭제"
                className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <i className="ri-delete-bin-line text-lg" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-background-100 cursor-pointer"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>
        </header>

        {hasImages && (
          <div className="bg-background-100">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={current ?? ''}
                alt={`${record.title} 사진 ${active + 1}`}
                className="h-full w-full object-cover object-top"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="이전 사진"
                    onClick={() =>
                      setActive((prev) => (prev - 1 + images.length) % images.length)
                    }
                    className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground-950/55 text-background-50 transition-colors hover:bg-foreground-950/75 cursor-pointer"
                  >
                    <i className="ri-arrow-left-s-line text-xl" />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 사진"
                    onClick={() => setActive((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground-950/55 text-background-50 transition-colors hover:bg-foreground-950/75 cursor-pointer"
                  >
                    <i className="ri-arrow-right-s-line text-xl" />
                  </button>
                  <span className="absolute right-3 top-3 rounded-full bg-foreground-950/60 px-2 py-0.5 text-[11px] font-medium text-background-50">
                    {active + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${i + 1}번째 사진`}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border transition-colors cursor-pointer ${
                      i === active ? 'border-primary-400' : 'border-background-200 opacity-70'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 px-4 py-4 md:px-5 md:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2.5 py-1 text-[11px] font-medium text-secondary-900">
              <i className="ri-calendar-line" />
              {formatRecordDate(record.record_date)}
            </span>
            {mood && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-medium text-accent-900">
                <span className="leading-none">{mood.emoji}</span>
                {mood.label}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-background-100 px-2.5 py-1 text-[11px] font-medium text-foreground-600">
              <i className={record.visibility === 'public' ? 'ri-earth-line' : 'ri-lock-line'} />
              {record.visibility === 'public' ? '공개 기록' : '나만 보기'}
            </span>
          </div>

          {onToggleVisibility && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-background-200 bg-background-100/70 px-4 py-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isPublic ? 'bg-accent-100 text-accent-700' : 'bg-secondary-100 text-secondary-800'
                  }`}
                >
                  <i className={isPublic ? 'ri-earth-line' : 'ri-lock-line'} />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-sm font-semibold text-foreground-900">
                    {isPublic ? '지금 공개 중이에요' : '지금 나만 보기 상태예요'}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
                    {isPublic
                      ? '내 기록방을 방문한 누구나 이 기록을 볼 수 있어요.'
                      : '공개로 바꾸면 내 기록방에 이 기록이 보여요.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => onToggleVisibility(record)}
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                  isPublic
                    ? 'border-background-300 bg-background-50 text-foreground-700 hover:bg-background-100'
                    : 'border-primary-300 bg-primary-500 text-background-50 hover:bg-primary-600'
                }`}
              >
                <i className={isPublic ? 'ri-lock-line' : 'ri-earth-line'} />
                {isPublic ? '나만 보기로 전환' : '공개로 전환'}
              </button>
            </div>
          )}

          <h2 className="font-heading text-xl font-bold leading-snug text-foreground-950">
            {record.title}
          </h2>

          {record.content && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground-700">
              {record.content}
            </p>
          )}

          {record.location && (
            <p className="inline-flex items-center gap-1 text-xs text-foreground-500">
              <i className="ri-map-pin-line" />
              {record.location}
            </p>
          )}

          {record.tags && record.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {record.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-background-100 px-2 py-0.5 text-[11px] text-foreground-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground-950/60 px-4"
          onClick={(e) => {
            e.stopPropagation();
            setConfirming(false);
          }}
          role="presentation"
        >
          <div
            className="w-full max-w-[360px] rounded-lg border border-background-200 bg-background-50 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <i className="ri-delete-bin-line text-xl" />
              </span>
              <div className="min-w-0">
                <h3 className="font-heading text-base font-bold text-foreground-950">
                  기록을 삭제할까요?
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-foreground-600">
                  삭제하면 되돌릴 수 없어요. 게시판에 공유한 기록이면 공유 글도 함께 사라져요.
                </p>
              </div>
            </div>
            {record.title && (
              <p className="mt-3 truncate rounded-md bg-background-100 px-3 py-2 text-xs font-medium text-foreground-700">
                {record.title}
              </p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-medium text-foreground-700 transition-colors hover:bg-background-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleConfirmDelete}
                className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <i className="ri-delete-bin-line" />
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}