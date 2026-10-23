import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';

const SUPABASE_URL = env.supabaseUrl;
const SUPABASE_ANON_KEY = env.supabaseAnonKey;

function parseStorageError(responseText: string, status: number): string {
  try {
    const parsed = JSON.parse(responseText) as { message?: string; error?: string };
    const message = parsed?.message || parsed?.error;
    if (message) return message;
  } catch {
    // fall through to generic message
  }
  return `업로드에 실패했어요. (오류 ${status})`;
}

/**
 * 파일을 Supabase Storage에 업로드하고 진행률(0~100)을 콜백으로 알려준다.
 * supabase-js의 upload()는 진행률을 제공하지 않아 XHR로 직접 업로드한다.
 * 성공 시 공개 URL을 반환한다.
 */
export function uploadWithProgress(
  bucket: string,
  path: string,
  file: File | Blob,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return supabase.auth.getSession().then(
    ({ data }) =>
      new Promise<string>((resolve, reject) => {
        const token = data.session?.access_token ?? SUPABASE_ANON_KEY;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
        xhr.setRequestHeader('x-upsert', 'false');
        xhr.setRequestHeader('cache-control', '3600');
        if (file.type) xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onProgress?.(100);
            resolve(`${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`);
          } else {
            reject(new Error(parseStorageError(xhr.responseText, xhr.status)));
          }
        };
        xhr.onerror = () => reject(new Error('네트워크 오류로 업로드에 실패했어요.'));
        xhr.ontimeout = () => reject(new Error('업로드 시간이 초과됐어요.'));
        xhr.send(file);
      }),
  );
}