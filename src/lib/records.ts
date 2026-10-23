// 개인 기록방(미니홈피) 전용 타입과 헬퍼.
// 기록 하나는 "나만 보기(private)" 또는 "공개(public)" 이고,
// 원하면 원하는 게시판에 공유(shared_post_id)했다가 내릴 수 있다.

export type RecordVisibility = 'private' | 'public';

export interface PersonalRecord {
  id: string;
  owner_id: string;
  title: string;
  content: string | null;
  mood: string | null;
  visibility: RecordVisibility;
  board_id: string | null;
  shared_post_id: string | null;
  images: string[] | null;
  tags: string[] | null;
  location: string | null;
  record_date: string;
  created_at: string;
  updated_at: string;
}

export interface RecordInput {
  title: string;
  content: string;
  mood: string | null;
  visibility: RecordVisibility;
  record_date: string;
  location: string | null;
  tags: string[];
  images: string[];
}

export interface RecordMood {
  key: string;
  emoji: string;
  label: string;
}

export const RECORD_MOODS: RecordMood[] = [
  { key: 'happy', emoji: '😊', label: '좋아요' },
  { key: 'calm', emoji: '🌿', label: '차분해요' },
  { key: 'excited', emoji: '✨', label: '신나요' },
  { key: 'proud', emoji: '💪', label: '뿌듯해요' },
  { key: 'tired', emoji: '😮‍💨', label: '지쳐요' },
  { key: 'sad', emoji: '🌧️', label: '울적해요' },
  { key: 'thanks', emoji: '🫶', label: '고마워요' },
  { key: 'blank', emoji: '📝', label: '그냥 기록' },
];

export function getMood(key: string | null | undefined): RecordMood | null {
  if (!key) return null;
  return RECORD_MOODS.find((m) => m.key === key) ?? null;
}

export function formatRecordDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

export function recordExcerpt(content: string | null | undefined, max = 140): string {
  if (!content) return '';
  const plain = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

/** 오늘 날짜를 YYYY-MM-DD 로 반환 (로컬 기준). */
export function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

// ---- 기록방 방명록(guestbook) ----------------------------------------------

export const GUESTBOOK_MAX_LENGTH = 300;
export const GUESTBOOK_NAME_MAX_LENGTH = 20;

export interface GuestbookEntry {
  id: string;
  room_owner_id: string;
  author_id: string | null;
  author_name: string | null;
  content: string;
  created_at: string;
}

export interface GuestbookInput {
  name: string;
  content: string;
}

/** 방명록 한 줄의 표시 이름(비어 있으면 익명). */
export function guestbookName(entry: GuestbookEntry): string {
  return entry.author_name?.trim() || '익명';
}