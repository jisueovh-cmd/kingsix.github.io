// 비로그인(게스트) 사용자의 좋아요/저장 상태를 브라우저에 가볍게 보관하는 유틸.
// 로그인 회원의 반응은 post_reactions 테이블(DB)에 저장되며, 이 파일은 게스트 전용 폴백이다.
// 간단한 상태값(게시글 id 목록)만 저장하므로 localStorage를 사용한다.

const LIKES_KEY = 'japari:likes';
const BOOKMARKS_KEY = 'japari:bookmarks';

function readSet(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeSet(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // 저장 공간 부족 등은 무시
  }
}

function toggle(key: string, id: string): boolean {
  const ids = readSet(key);
  const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
  writeSet(key, next);
  return next.includes(id);
}

export function readLikedIds(): string[] {
  return readSet(LIKES_KEY);
}

export function readBookmarkedIds(): string[] {
  return readSet(BOOKMARKS_KEY);
}

export function localToggleLike(postId: string): boolean {
  return toggle(LIKES_KEY, postId);
}

export function localToggleBookmark(postId: string): boolean {
  return toggle(BOOKMARKS_KEY, postId);
}