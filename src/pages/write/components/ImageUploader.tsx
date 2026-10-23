import { useRef, useState } from 'react';
import { isAllowedImage, isOversizedImage, uploadPostImage } from '@/lib/postImage';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  userId?: string | null;
  disabled?: boolean;
}

export default function ImageUploader({
  images,
  onChange,
  userId,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList).slice(0, 10);
    for (const file of files) {
      if (!isAllowedImage(file)) {
        setError('JPG, PNG, WEBP, GIF 이미지만 올릴 수 있어요.');
        return;
      }
      if (isOversizedImage(file)) {
        setError('이미지는 한 장당 5MB까지 올릴 수 있어요.');
        return;
      }
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const url = await uploadPostImage(file, userId);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지를 올리지 못했어요.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    if (index <= 0) return;
    const next = [...images];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-dashed border-background-300 bg-background-50 px-4 py-2.5 text-sm font-medium text-foreground-700 transition-colors hover:border-primary-400 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {uploading ? (
            <>
              <i className="ri-loader-4-line animate-spin" />
              올리는 중...
            </>
          ) : (
            <>
              <i className="ri-image-add-line" />
              사진 추가
            </>
          )}
        </button>
        <p className="text-xs text-foreground-500">
          여러 장 올릴 수 있어요 · 첫 번째가 대표 이미지 (장당 5MB 이하)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-primary-700">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((src, index) => (
            <div
              key={src}
              className="group relative overflow-hidden rounded-lg border border-background-200 bg-background-100"
            >
              <img
                src={src}
                alt={`첨부 이미지 ${index + 1}`}
                className="h-[120px] w-full object-cover object-top"
              />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-semibold text-background-50">
                  대표
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-foreground-950/60 px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium text-background-50 transition-colors hover:text-primary-200 cursor-pointer"
                  >
                    대표로
                  </button>
                ) : (
                  <span className="text-[10px] text-background-100">대표 이미지</span>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label="이미지 삭제"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-background-50 transition-colors hover:bg-primary-500 cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}