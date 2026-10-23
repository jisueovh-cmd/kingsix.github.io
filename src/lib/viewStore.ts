// 비로그인(게스트) 방문자의 조회 중복 방지용 유틸.
// 게스트는 DB의 user 기준을 쓸 수 없으므로, 브라우저별 고유 키와 "이미 본 글" 목록을 localStorage에 둔다.
// 회원의 조회 중복은 DB(post_views)에서 계정 기준으로 처리되므로 이 파일은 게스트 전용이다.

const GUEST_KEY = 'japari:viewer-key';
const VIEWED_KEY = 'japari:viewed-posts';

function randomKey(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `g-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// 브라우저마다 고정된 게스트 식별 키를 반환한다(없으면 생성해 저장).
export function getGuestKey(): string {
  try {
    let key = localStorage.getItem(GUEST_KEY);
    if (!key) {
      key = randomKey();
      localStorage.setItem(GUEST_KEY, key);
    }
    return key;
  } catch {
    return '';
  }
}

function readViewed(): string[] {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function hasViewedLocally(postId: string): boolean {
  return readViewed().includes(postId);
}

export function markViewedLocally(postId: string): void {
  try {
    const ids = readViewed();
    if (ids.includes(postId)) return;
    localStorage.setItem(VIEWED_KEY, JSON.stringify([...ids, postId]));
  } catch {
    // 저장 공간 부족 등은 무시
  }
}