import { useRef, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/feature/ToastProvider';
import {
  BOARD_ICON_PRESETS,
  DEFAULT_BOARD_ICON,
  createBoard,
} from '@/lib/boards';
import { isAllowedImage, isOversizedImage, uploadPostImage } from '@/lib/postImage';
import type { Board } from '@/types/home';

interface CreateBoardModalProps {
  onClose: () => void;
  onCreated: (board: Board) => void;
}

export default function CreateBoardModal({ onClose, onCreated }: CreateBoardModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(DEFAULT_BOARD_ICON);
  const [cover, setCover] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCover = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!isAllowedImage(file)) {
      setError('JPG, PNG, WEBP, GIF 이미지만 올릴 수 있어요.');
      return;
    }
    if (isOversizedImage(file)) {
      setError('이미지는 5MB까지 올릴 수 있어요.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const url = await uploadPostImage(file, user?.id);
      setCover(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지를 올리지 못했어요.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError('로그인이 필요해요.');
      return;
    }
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    if (!trimmedName) {
      setError('게시판 이름을 입력해주세요.');
      return;
    }
    if (!trimmedDesc) {
      setError('한줄 소개를 입력해주세요.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const board = await createBoard({
        name: trimmedName,
        description: trimmedDesc,
        icon,
        coverImage: cover,
        ownerId: user.id,
      });
      toast('새 게시판을 만들었어요!', 'success');
      onCreated(board);
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시판을 만들지 못했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-foreground-950/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-background-200 bg-background-50 p-5 sm:max-w-lg sm:rounded-lg sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground-950">새 게시판 만들기</h3>
            <p className="mt-1 text-xs text-foreground-500">
              나만의 주제로 게시판을 열어보세요. 만든 게시판은 홈 대문에도 보여요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground-500 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="cb-name" className="block text-sm font-medium text-foreground-800">
              게시판 이름 <span className="text-primary-600">*</span>
            </label>
            <input
              id="cb-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="예: 등산 모임, 우리 동네 소식"
              className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
            />
            <p className="mt-1 text-right text-[11px] text-foreground-400">{name.length}/20</p>
          </div>

          <div>
            <label htmlFor="cb-desc" className="block text-sm font-medium text-foreground-800">
              한줄 소개 <span className="text-primary-600">*</span>
            </label>
            <input
              id="cb-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={60}
              placeholder="어떤 게시판인지 한 줄로 알려주세요"
              className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
            />
            <p className="mt-1 text-right text-[11px] text-foreground-400">
              {description.length}/60
            </p>
          </div>

          <div>
            <span className="block text-sm font-medium text-foreground-800">
              아이콘 <span className="text-foreground-400">(선택)</span>
            </span>
            <div className="mt-2 grid grid-cols-8 gap-2">
              {BOARD_ICON_PRESETS.map((preset) => {
                const active = preset === icon;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setIcon(preset)}
                    aria-label={`아이콘 ${preset}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                      active
                        ? 'border-secondary-400 bg-secondary-100 text-secondary-800'
                        : 'border-background-200 bg-background-50 text-foreground-500 hover:border-secondary-300 hover:text-secondary-700'
                    }`}
                  >
                    <i className={`${preset} text-base`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-foreground-800">
              대표 이미지 <span className="text-foreground-400">(선택)</span>
            </span>
            {cover ? (
              <div className="mt-2 flex items-center gap-3">
                <span className="block h-16 w-28 shrink-0 overflow-hidden rounded-md border border-background-200">
                  <img src={cover} alt="대표 이미지 미리보기" className="h-full w-full object-cover object-top" />
                </span>
                <button
                  type="button"
                  onClick={() => setCover(null)}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-1.5 text-xs text-foreground-700 transition-colors hover:bg-background-100 cursor-pointer"
                >
                  <i className="ri-delete-bin-line" />
                  삭제
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="mt-2 inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-dashed border-background-300 bg-background-50 px-4 py-2.5 text-sm font-medium text-foreground-700 transition-colors hover:border-secondary-400 hover:text-secondary-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin" />
                    올리는 중...
                  </>
                ) : (
                  <>
                    <i className="ri-image-add-line" />
                    이미지 올리기
                  </>
                )}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCover(e.target.files)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
              <i className="ri-error-warning-line text-base" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin" />
                  만드는 중...
                </>
              ) : (
                <>
                  <i className="ri-add-line" />
                  게시판 만들기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}