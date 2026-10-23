import { useEffect, useState } from 'react';
import type { PersonalRecord, RecordInput, RecordVisibility } from '@/lib/records';
import { RECORD_MOODS, todayISO } from '@/lib/records';
import ImageUploader from '@/pages/write/components/ImageUploader';
import TagInput from '@/pages/write/components/TagInput';

interface RecordEditorProps {
  open: boolean;
  initial: PersonalRecord | null;
  userId?: string | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: RecordInput) => void;
}

export default function RecordEditor({
  open,
  initial,
  userId,
  submitting,
  error,
  onClose,
  onSubmit,
}: RecordEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [recordDate, setRecordDate] = useState(todayISO());
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<RecordVisibility>('private');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setContent(initial.content ?? '');
      setMood(initial.mood);
      setRecordDate(initial.record_date || todayISO());
      setLocation(initial.location ?? '');
      setTags(Array.isArray(initial.tags) ? initial.tags : []);
      setImages(Array.isArray(initial.images) ? initial.images : []);
      setVisibility(initial.visibility);
    } else {
      setTitle('');
      setContent('');
      setMood(null);
      setRecordDate(todayISO());
      setLocation('');
      setTags([]);
      setImages([]);
      setVisibility('private');
    }
    setLocalError(null);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = () => {
    setLocalError(null);
    if (!title.trim()) {
      setLocalError('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setLocalError('오늘의 기록을 적어주세요.');
      return;
    }
    onSubmit({
      title,
      content,
      mood,
      record_date: recordDate,
      location: location || null,
      tags,
      images,
      visibility,
    });
  };

  const shownError = localError ?? error;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-foreground-950/50 px-4 py-6 md:py-10">
      <div className="w-full max-w-[680px] rounded-lg border border-background-200 bg-background-50 shadow-none">
        <header className="flex items-center justify-between gap-4 border-b border-background-200 px-5 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-quill-pen-line text-lg" />
            </span>
            <h2 className="font-heading text-lg font-bold text-foreground-950">
              {initial ? '기록 고치기' : '오늘의 기록 쓰기'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </header>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5 md:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="record-date"
                className="block text-sm font-semibold text-foreground-900"
              >
                날짜
              </label>
              <input
                id="record-date"
                name="record_date"
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
              />
            </div>
            <div>
              <label
                htmlFor="record-location"
                className="block text-sm font-semibold text-foreground-900"
              >
                장소 (선택)
              </label>
              <input
                id="record-location"
                name="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={80}
                placeholder="예) 집 앞 산책길"
                className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
              />
            </div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-foreground-900">오늘 기분</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {RECORD_MOODS.map((m) => {
                const active = mood === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMood(active ? null : m.key)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'border-accent-400 bg-accent-100 text-accent-900'
                        : 'border-background-300 bg-background-50 text-foreground-700 hover:border-accent-300'
                    }`}
                  >
                    <span className="text-base leading-none">{m.emoji}</span>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="record-title"
              className="block text-sm font-semibold text-foreground-900"
            >
              제목
            </label>
            <input
              id="record-title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="오늘을 한 줄로 적어보세요"
              className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
            />
          </div>

          <div>
            <label
              htmlFor="record-content"
              className="block text-sm font-semibold text-foreground-900"
            >
              기록
            </label>
            <textarea
              id="record-content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={7}
              placeholder="오늘 있었던 소소한 일, 취미로 한 것들, 기분을 자유롭게 적어두세요."
              className="mt-1.5 w-full resize-y rounded-md border border-background-300 bg-background-50 px-3 py-3 text-sm leading-relaxed text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
            />
            <div className="mt-1 text-right text-xs text-foreground-400">{content.length}/2000</div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-foreground-900">사진 (선택)</span>
            <div className="mt-1.5">
              <ImageUploader images={images} onChange={setImages} userId={userId} />
            </div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-foreground-900">태그 (선택)</span>
            <div className="mt-1.5">
              <TagInput tags={tags} onChange={setTags} />
            </div>
          </div>

          <div className="rounded-lg border border-background-200 bg-background-100/60 p-4">
            <span className="block text-sm font-semibold text-foreground-900">공개 범위</span>
            <p className="mt-1 text-xs text-foreground-500">
              공개로 두면 내 기록방 주소로 들어온 사람에게 이 기록이 보여요.
            </p>
            <div className="mt-3 inline-flex rounded-full bg-background-200/70 p-1">
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  visibility === 'private'
                    ? 'bg-background-50 text-foreground-900'
                    : 'text-foreground-600'
                }`}
              >
                <i className="ri-lock-line mr-1" />
                나만 보기
              </button>
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  visibility === 'public'
                    ? 'bg-background-50 text-foreground-900'
                    : 'text-foreground-600'
                }`}
              >
                <i className="ri-earth-line mr-1" />
                공개
              </button>
            </div>
          </div>

          {shownError && (
            <div className="flex items-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
              <i className="ri-error-warning-line text-base" />
              {shownError}
            </div>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-background-200 px-5 py-4 sm:flex-row sm:justify-end md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-medium text-foreground-700 transition-colors hover:bg-background-100 cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <i className="ri-loader-4-line animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <i className="ri-save-line" />
                {initial ? '수정 완료' : '기록 저장'}
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}