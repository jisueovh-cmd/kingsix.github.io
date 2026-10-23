export interface NavBoard {
  slug: string;
  name: string;
}

export interface NavItem {
  label: string;
  to: string;
}

export const NAV_BOARDS: NavBoard[] = [
  { slug: 'travel', name: '여행기' },
  { slug: 'food', name: '맛집게시판' },
  { slug: 'honey', name: '별팁' },
  { slug: 'collect', name: '수집 공간' },
  { slug: 'garden', name: '식물게시판' },
  { slug: 'make', name: '제작 공방' },
  { slug: 'together', name: '함께하는 취미' },
  { slug: 'hobbyist', name: '취미人' },
];

export const NAV_EXPLORE: NavItem[] = [
  { label: '이야기', to: '/explore?type=story' },
  { label: '사진', to: '/explore?type=photo' },
  { label: '리뷰', to: '/explore?type=review' },
  { label: '장소', to: '/explore?type=place' },
];

// ⛔ 불변 규칙: 카테고리 6개(여행/나만의 정원/맛집탐방/제작/수집/기타)를 유지한다.
//   '제작'(make)·'수집'(collect)을 삭제하거나 '기타'로 병합하지 말 것. (project_plan.md '0. 불변 규칙' 참고)
export const NAV_CATEGORIES: NavItem[] = [
  { label: '여행', to: '/category/travel' },
  { label: '나만의 정원', to: '/category/garden' },
  { label: '맛집탐방', to: '/category/food' },
  { label: '제작', to: '/category/make' },
  { label: '수집', to: '/category/collect' },
  { label: '기타', to: '/category/etc' },
];

export const NAV_COMMUNITY: NavItem[] = [
  { label: '사람들', to: '/people' },
  { label: '내 기록방', to: '/room' },
  { label: '실시간 채팅', to: '/people#small-talk' },
];

export const NAV_AGE_GROUPS: NavItem[] = [
  { label: '10대 취미방', to: '/board/age-10' },
  { label: '20대 취미방', to: '/board/age-20' },
  { label: '30대 취미방', to: '/board/age-30' },
  { label: '40대 취미방', to: '/board/age-40' },
  { label: '50대 취미방', to: '/board/age-50' },
  { label: '60대 취미방', to: '/board/age-60' },
];

export const SITE_NAME = '취미 in 자파리';
export const SITE_TAGLINE = '소소한 일상과 취미를 담아두는 아지트';