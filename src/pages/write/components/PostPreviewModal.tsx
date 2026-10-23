import PostBody from '@/components/feature/PostBody';
import type { ContentType, PostLink } from '@/types/home';

export interface PreviewData {
  title: string;
  author: string;
  contentType: ContentType;
  contentTypeLabel: string;
  rating: number;
  location: string;
  content: string;
  images: string[];
  videos: string[];
  tags: string[];
  links: PostLink[];
}

interface PostPreviewModalProps {
  open: boolean;
  data: PreviewData;
  onClose: () => void;
}

export default function PostPreviewModal({ open, data, onClose }: PostPreviewModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-950/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50">
        <div className="flex items-center justify-between border-b border-background-200 px-5 py-4">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground-950">
            <i className="ri-eye-line text-primary-600" />
            미리보기
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-background-200 cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs text-secondary-900">
              {data.contentTypeLabel}
            </span>
            {data.contentType === 'review' && (
              <span className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`text-sm ${i < data.rating ? 'ri-star-fill' : 'ri-star-line'}`}
                  />
                ))}
                <span className="ml-1 text-xs font-medium text-foreground-700">
                  {data.rating}점
                </span>
              </span>
            )}
          </div>

          <h1 className="font-heading text-xl font-bold leading-snug text-foreground-950 md:text-2xl">
            {data.title.trim() || '제목을 입력해주세요'}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-foreground-500">
            <i className="ri-user-3-line text-sm text-accent-600" />
            {data.author.trim() || '익명'}
          </p>

          <div className="mt-6">
            <PostBody
              content={data.content.trim() || '내용을 입력하면 여기에 표시돼요.'}
              images={data.images}
              videos={data.videos}
              tags={data.tags}
              links={data.links}
              location={data.location}
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-background-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap rounded-md bg-primary-500 px-5 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}