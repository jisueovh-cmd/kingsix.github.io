// 숨겨진 관리 도구(/desk)에 접근할 수 있는 계정 이메일 목록.
// 이 목록에 없는 계정이 접속하면 '페이지를 찾을 수 없어요'로만 보인다.
// AI 지역 정보 생성(글쓰기)도 이 목록의 계정만 쓸 수 있다.
// 새로 추가하려면 이메일을 쉼표로 구분해 넣으면 된다.
export const OWNER_EMAILS = ['gisueovh7@naver.com'];

/** 로그인한 계정이 관리자(숨김 도구·AI 글쓰기 권한)인지 확인한다. */
export function isOwner(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return OWNER_EMAILS.some((item) => item.trim().toLowerCase() === normalized);
}