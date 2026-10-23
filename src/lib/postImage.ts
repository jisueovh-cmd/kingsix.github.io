import { supabase } from '@/lib/supabase';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function isAllowedImage(file: File): boolean {
  return ALLOWED.includes(file.type);
}

export function isOversizedImage(file: File): boolean {
  return file.size > MAX_SIZE;
}

function buildPath(folder: string, fileName: string): string {
  const rawName = fileName || 'image.png';
  const ext =
    (rawName.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const safeFolder = (folder || 'guest').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'guest';
  return `${safeFolder}/${token}.${ext}`;
}

/** 게시글 이미지를 Supabase Storage에 올리고 공개 URL을 돌려준다. */
export async function uploadPostImage(file: File, userId?: string | null): Promise<string> {
  const path = buildPath(userId ?? 'guest', file.name);
  const { error } = await supabase.storage.from('posts').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('posts').getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('이미지 주소를 가져오지 못했어요.');
  return data.publicUrl;
}