import { useRef, useState } from 'react';
import { uploadWithProgress } from '@/lib/storageUpload';

interface VideoUploaderProps {
  videos: string[];
  onChange: (videos: string[]) => void;
  userId?: string | null;
  disabled?: boolean;
}

const MAX_SIZE = 50 * 1024 * 1024;
const MAX_COUNT = 3;
const ALLOWED = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

function buildPath(folder: string, fileName: string): string {
  const ext =
    (fileName.split('.').pop() ?? 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const safeFolder = (folder || 'guest').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'guest';
  return `${safeFolder}/videos/${token}.${ext}`;
}

export default function VideoUploader({
  videos,
  onChange,
  userId,
  disabled,
}: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentName, setCurrentName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const remaining = MAX_COUNT - videos.length;
    if (remaining <= 0) {
      setError(`동영상은 최대 ${MAX_COUNT}개까지 올릴 수 있어요.`);
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        setError('MP4, WEBM, MOV 동영상만 올릴 수 있어요.');
        return;
      }
      if (file.size > MAX_SIZE) {
        setError('동영상은 한 개당 50MB까지 올릴 수 있어요.');
        return;
      }
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0) || 1;
    setUploading(true);
    setProgress(0);
    setCurrentName(files[0]?.name ?? '');
    try {
      const uploaded: string[] = [];
      let completedBytes = 0;
      for (const file of files) {
        setCurrentName(file.name);
        const path = buildPath(userId ?? 'guest', file.name);
        const base = completedBytes;
        const publicUrl = await uploadWithProgress('posts', path, file, (percent) => {
          const loaded = base + (file.size * percent) / 100;
          setProgress(Math.min(100, Math.round((loaded / totalBytes) * 100)));
        });
        completedBytes += file.size;
        uploaded.push(publicUrl);
      }
      setProgress(100);
      onChange([...videos, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '동영상을 올리지 못했어요.');
    } finally {
      setUploading(false);
      setCurrentName('');
      if (inputRef.current) inputRef.current.value = '';
      window.setTimeout(() => setProgress(0), 400);
    }
  };

  const removeAt = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
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
              올리는 중 {progress}%
            </>
          ) : (
            <>
              <i className="ri-video-add-line" />
              동영상 추가
            </>
          )}
        </button>
        <p className="text-xs text-foreground-500">
          최대 3개 · 개당 50MB 이하 (MP4 · WEBM · MOV)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploading && (
        <div className="mt-3 rounded-lg border border-background-200 bg-background-100/70 px-4 py-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-1.5 text-foreground-700">
              <i className="ri-upload-cloud-2-line shrink-0 text-primary-600" />
              <span className="truncate">{currentName || '동영상'} 올리는 중...</span>
            </span>
            <span className="shrink-0 font-semibold text-primary-700">{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background-200">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-primary-700">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}

      {videos.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {videos.map((src, index) => (
            <div
              key={src}
              className="group relative overflow-hidden rounded-lg border border-background-200 bg-foreground-950"
            >
              <video
                src={src}
                controls
                playsInline
                className="h-[220px] w-full bg-foreground-950 object-contain"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="동영상 삭제"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground-950/70 text-background-50 transition-colors hover:bg-primary-500 cursor-pointer"
              >
                <i className="ri-delete-bin-line text-sm" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}