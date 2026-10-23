import { useState } from 'react';
import { getYouTubeId } from '@/lib/youtube';
import type { PostLink } from '@/types/home';

interface LinkInputProps {
  links: PostLink[];
  onChange: (links: PostLink[]) => void;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function LinkInput({ links, onChange }: LinkInputProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError('링크 주소를 입력해주세요.');
      return;
    }
    if (links.some((l) => l.url === normalized)) {
      setError('이미 추가된 링크예요.');
      return;
    }
    if (links.length >= 5) {
      setError('링크는 최대 5개까지 추가할 수 있어요.');
      return;
    }
    onChange([...links, { url: normalized, title: title.trim() || undefined }]);
    setUrl('');
    setTitle('');
    setError(null);
  };

  const previewId = getYouTubeId(normalizeUrl(url));

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          placeholder="링크 이름 (선택)"
          className="w-full rounded-md border border-background-300 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none sm:w-[200px]"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="https://example.com"
          className="min-w-0 flex-1 rounded-md border border-background-300 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-secondary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-secondary-600 cursor-pointer"
        >
          <i className="ri-add-line" />
          추가
        </button>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-primary-700">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}

      {previewId && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50/70 p-2.5">
          <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-foreground-950">
            <img
              src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
              alt="유튜브 영상 썸네일 미리보기"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-foreground-950/20">
              <i className="ri-play-circle-fill text-2xl text-background-50" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground-900">
              <i className="ri-youtube-fill text-primary-600" />
              유튜브 영상으로 인식됐어요
            </p>
            <p className="mt-0.5 text-xs text-foreground-600">
              추가하면 본문에서 영상 플레이어로 재생돼요.
            </p>
          </div>
        </div>
      )}

      {links.length > 0 && (
        <ul className="mt-3 space-y-2">
          {links.map((link) => {
            const isYouTube = Boolean(getYouTubeId(link.url));
            return (
              <li
                key={link.url}
                className="flex items-center gap-2 rounded-md border border-background-200 bg-background-50 px-3 py-2"
              >
                <i
                  className={`shrink-0 ${
                    isYouTube ? 'ri-youtube-fill text-primary-600' : 'ri-link text-primary-600'
                  }`}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground-800">
                  {link.title?.trim() || link.url}
                </span>
                {isYouTube && (
                  <span className="hidden shrink-0 items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-medium text-secondary-900 sm:inline-flex">
                    <i className="ri-play-circle-line" />
                    영상으로 재생
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onChange(links.filter((l) => l.url !== link.url))}
                  aria-label="링크 삭제"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-foreground-500 transition-colors hover:bg-background-200 hover:text-primary-700 cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-sm" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}