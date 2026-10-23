import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AvatarUploaderProps {
  userId: string;
  currentUrl: string | null;
  onChange: (url: string | null) => void;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function buildPath(userId: string, fileName: string): string {
  const ext =
    (fileName.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `avatars/${userId}/${token}.${ext}`;
}

/**
 * 프로필 사진 업로드/삭제.
 * 사진이 없어도 빈 프사 자리를 강제하지 않고, 작은 '사진 추가' 버튼만 보여준다.
 */
export default function AvatarUploader({ userId, currentUrl, onChange }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError('JPG, PNG, WEBP, GIF 이미지만 올릴 수 있어요.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('프로필 사진은 5MB까지 올릴 수 있어요.');
      return;
    }

    setUploading(true);
    try {
      const path = buildPath(userId, file.name);
      const { error: upErr } = await supabase.storage
        .from('posts')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('posts').getPublicUrl(path);
      if (!data?.publicUrl) throw new Error('사진 주소를 만들지 못했어요.');
      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '사진을 올리지 못했어요.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {currentUrl ? (
        <img
          src={currentUrl}
          alt="내 프로필 사진"
          className="h-16 w-16 shrink-0 rounded-full border border-background-200 object-cover object-top"
        />
      ) : (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-background-300 text-foreground-400">
          <i className="ri-camera-3-line text-2xl" />
        </span>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm font-medium text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {uploading ? (
              <>
                <i className="ri-loader-4-line animate-spin" />
                올리는 중...
              </>
            ) : (
              <>
                <i className="ri-image-add-line" />
                {currentUrl ? '사진 변경' : '사진 추가'}
              </>
            )}
          </button>
          {currentUrl && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                setError(null);
                onChange(null);
              }}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm font-medium text-foreground-600 transition-colors hover:border-primary-300 hover:text-primary-700 disabled:opacity-60 cursor-pointer"
            >
              <i className="ri-delete-bin-line" />
              삭제
            </button>
          )}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-foreground-500">
          사진을 올리지 않으면 프로필에는 아이디·닉네임만 보여요. (5MB 이하 JPG·PNG·WEBP·GIF)
        </p>
        {error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary-700">
            <i className="ri-error-warning-line" />
            {error}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  );
}