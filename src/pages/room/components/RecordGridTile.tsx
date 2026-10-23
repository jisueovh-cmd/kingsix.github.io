import type { PersonalRecord } from '@/lib/records';
import { formatShortDate, getMood, recordExcerpt } from '@/lib/records';

interface RecordGridTileProps {
  record: PersonalRecord;
  onOpen: (record: PersonalRecord) => void;
}

/**
 * 인스타그램 그리드처럼 정사각형 썸네일 한 칸.
 * 사진이 있으면 사진을, 없으면 기분 이모지 + 제목을 보여준다.
 */
export default function RecordGridTile({ record, onOpen }: RecordGridTileProps) {
  const mood = getMood(record.mood);
  const cover = record.images && record.images.length > 0 ? record.images[0] : null;
  const imageCount = record.images ? record.images.length : 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(record)}
      aria-label={`${record.title} 기록 보기`}
      className="group relative aspect-square w-full overflow-hidden rounded-lg border border-background-200 bg-background-100 text-left cursor-pointer"
    >
      {cover ? (
        <img
          src={cover}
          alt={`${record.title} 대표 사진`}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between bg-accent-100/70 p-3.5 md:p-4">
          <span className="text-2xl leading-none">{mood ? mood.emoji : '📝'}</span>
          <div className="min-w-0">
            <p className="line-clamp-3 font-heading text-sm font-bold leading-snug text-foreground-950">
              {record.title}
            </p>
            <p className="mt-1 text-[11px] text-foreground-500">
              {formatShortDate(record.record_date)}
            </p>
          </div>
        </div>
      )}

      <span className="absolute inset-0 flex items-center justify-center bg-foreground-950/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="flex items-center gap-1.5 text-xs font-medium text-background-50">
          <i className="ri-article-line text-base" />
          기록 보기
        </span>
      </span>

      {imageCount > 1 && (
        <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-foreground-950/70 px-2 py-0.5 text-[10px] font-medium text-background-50">
          <i className="ri-image-2-line" />
          {imageCount}
        </span>
      )}
      {!cover && record.content && (
        <span className="pointer-events-none absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background-50/80 text-foreground-600">
          <i className="ri-align-left text-xs" />
        </span>
      )}
      <span className="sr-only">{recordExcerpt(record.content, 60)}</span>
    </button>
  );
}