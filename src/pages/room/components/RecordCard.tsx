import { useState } from 'react';
import type { Board } from '@/types/home';
import type { PersonalRecord } from '@/lib/records';
import { formatRecordDate, getMood, recordExcerpt } from '@/lib/records';

interface RecordCardProps {
  record: PersonalRecord;
  boards?: Board[];
  readOnly?: boolean;
  busy?: boolean;
  onEdit?: (record: PersonalRecord) => void;
  onDelete?: (record: PersonalRecord) => void;
  onToggleVisibility?: (record: PersonalRecord) => void;
  onShare?: (record: PersonalRecord, boardId: string) => void;
  onUnshare?: (record: PersonalRecord) => void;
}

export default function RecordCard({
  record,
  boards = [],
  readOnly,
  busy,
  onEdit,
  onDelete,
  onToggleVisibility,
  onShare,
  onUnshare,
}: RecordCardProps) {
  const mood = getMood(record.mood);
  const cover = record.images && record.images.length > 0 ? record.images[0] : null;
  const extraCount = record.images ? Math.max(0, record.images.length - 1) : 0;
  const isPublic = record.visibility === 'public';
  const isShared = Boolean(record.shared_post_id);
  const sharedBoard = boards.find((b) => b.id === record.board_id) ?? null;
  const [pickBoard, setPickBoard] = useState(record.board_id ?? '');

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-lg border bg-background-50 transition-colors ${
        isPublic ? 'border-accent-200' : 'border-background-200'
      }`}
    >
      {cover && (
        <div className="relative h-[168px] w-full overflow-hidden bg-background-100">
          <img
            src={cover}
            alt={`${record.title} 대표 사진`}
            className="h-full w-full object-cover object-top"
          />
          {extraCount > 0 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-foreground-950/70 px-2 py-0.5 text-[10px] font-medium text-background-50">
              +{extraCount}장
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 md:p-5">
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
          {readOnly ? (
            isPublic && (
              <span className="inline-flex items-center gap-1 rounded-full bg-background-100 px-2.5 py-1 text-[11px] text-foreground-600">
                <i className="ri-earth-line" />
                공개
              </span>
            )
          ) : (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                isPublic
                  ? 'bg-accent-100 text-accent-900'
                  : 'bg-background-100 text-foreground-600'
              }`}
            >
              <i className={isPublic ? 'ri-earth-line' : 'ri-lock-line'} />
              {isPublic ? '공개' : '나만 보기'}
            </span>
          )}
        </div>

        <h3 className="mt-3 font-heading text-base font-bold leading-snug text-foreground-950">
          {record.title}
        </h3>

        {record.content && (
          <p className="mt-2 text-sm leading-relaxed text-foreground-600">
            {recordExcerpt(record.content)}
          </p>
        )}

        {record.location && (
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-foreground-500">
            <i className="ri-map-pin-line" />
            {record.location}
          </p>
        )}

        {record.tags && record.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {record.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-background-100 px-2 py-0.5 text-[11px] text-foreground-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {!readOnly && (
          <div className="mt-auto space-y-3 pt-4">
            <div className="flex flex-wrap items-center gap-2 border-t border-background-100 pt-3">
              {isShared && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-medium text-primary-800">
                  <i className="ri-share-forward-line" />
                  {sharedBoard ? `${sharedBoard.name} 공유 중` : '게시판 공유 중'}
                </span>
              )}
              {!isShared && (
                <div className="flex flex-1 items-center gap-2">
                  <select
                    value={pickBoard}
                    onChange={(e) => setPickBoard(e.target.value)}
                    className="min-w-0 flex-1 rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs text-foreground-800 focus:border-primary-400 focus:outline-none"
                  >
                    <option value="">게시판 선택</option>
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy || !pickBoard}
                    onClick={() => onShare?.(record, pickBoard)}
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    <i className="ri-share-forward-line" />
                    게시판에 공유
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onToggleVisibility?.(record)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                  isPublic
                    ? 'border-accent-300 bg-accent-50 text-accent-800 hover:bg-accent-100'
                    : 'border-background-300 bg-background-50 text-foreground-700 hover:bg-background-100'
                }`}
              >
                <i className={isPublic ? 'ri-earth-line' : 'ri-lock-line'} />
                {isPublic ? '공개중 · 비공개로' : '공개로 전환'}
              </button>

              <div className="flex items-center gap-1">
                {isShared && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onUnshare?.(record)}
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-background-300 px-2.5 py-2 text-xs font-medium text-foreground-600 transition-colors hover:bg-background-100 disabled:opacity-50 cursor-pointer"
                  >
                    <i className="ri-arrow-down-circle-line" />
                    내리기
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEdit?.(record)}
                  aria-label="기록 수정"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-background-300 text-foreground-600 transition-colors hover:bg-background-100 cursor-pointer"
                >
                  <i className="ri-pencil-line" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete?.(record)}
                  aria-label="기록 삭제"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-background-300 text-foreground-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50 cursor-pointer"
                >
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}