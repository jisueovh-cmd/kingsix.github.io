// Route → SEO resolution. Produces reasonable per-page metadata for every
// route so the centralized head manager always has a value to apply.

import { BRAND_NAME, SITE_DESCRIPTION, SITE_URL, DEFAULT_OG_IMAGE, type SeoData } from './seo';
import { websiteSchema, organizationSchema, collectionPageSchema } from './schema';

// ⛔ 불변 규칙: 카테고리 6개(여행/나만의 정원/맛집탐방/제작/수집/기타)를 유지한다.
//   '제작'(make)·'수집'(collect) 항목을 삭제하거나 '기타'로 병합하지 말 것. (project_plan.md '0. 불변 규칙' 참고)
const CATEGORY_NAMES: Record<string, string> = {
  travel: '여행',
  garden: '나만의 정원',
  food: '맛집탐방',
  make: '제작',
  collect: '수집',
  etc: '기타',
};

const BOARD_NAMES: Record<string, string> = {
  travel: '여행기',
  food: '맛집탐방',
  garden: '나만의 정원',
  honey: '별팁',
  make: '제작 공방',
  collect: '수집 공간',
  together: '함께하는 취미 공유방',
  hobbyist: '취미人',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  travel: '세상 곳곳을 누비며 담은 여행기와 여행 팁을 나눠요. 당일치기부터 장기 여행까지 여행 이야기를 만나보세요.',
  garden: '작은 화분부터 베란다 텃밭까지, 식물을 키우는 즐거움을 나눠요. 나만의 정원 이야기를 만나보세요.',
  food: '동네 맛집부터 여행지 별미까지, 미식의 순간을 기록해요. 맛집탐방 이야기를 만나보세요.',
  make: '도자기, 목공, 뜨개, 캔들까지 직접 손으로 만드는 과정과 결과물을 나눠요. 제작 취미 이야기를 만나보세요.',
  collect: '피규어, 우표, 빈티지 소품까지 소중하게 모아온 수집품 이야기를 나눠요. 수집 취미 이야기를 만나보세요.',
  etc: '게임, 독서, 꿀팁까지 다양한 취미를 자유롭게 담아요. 기타 취미 이야기를 만나보세요.',
};

export function resolveRouteSeo(pathname: string): SeoData {
  const path = pathname.split('?')[0].split('#')[0] || '/';

  if (path === '/') {
    return {
      title: `${BRAND_NAME} - 소소한 일상과 취미를 담아두는 아지트`,
      description: SITE_DESCRIPTION,
      keywords: '취미 커뮤니티, 취미 자파리, 여행기, 맛집탐방, 식물키우기',
      path: '/',
      type: 'website',
      image: DEFAULT_OG_IMAGE,
      schema: websiteSchema(),
    };
  }

  if (path === '/explore') {
    return {
      title: `콘텐츠 탐색 - ${BRAND_NAME}`,
      description:
        '이야기, 사진, 리뷰, 장소까지 — 여행·정원·맛집·만들기 등 다양한 취미 콘텐츠를 취미 자파리에서 탐색해보세요.',
      keywords: '취미 콘텐츠, 이야기, 사진, 리뷰, 장소',
      path: '/explore',
      image: DEFAULT_OG_IMAGE,
      schema: collectionPageSchema({
        name: `콘텐츠 탐색 - ${BRAND_NAME}`,
        description:
          '이야기, 사진, 리뷰, 장소까지 다양한 취미 콘텐츠를 한곳에서 탐색해보세요.',
        url: `${SITE_URL}/explore`,
      }),
    };
  }

  if (path === '/people') {
    return {
      title: `함께하는 사람들 - ${BRAND_NAME}`,
      description:
        '취미로 연결된 사람들의 이야기를 만나고 실시간 잡담을 나눠보세요. 취미 자파리 커뮤니티에 참여해보세요.',
      keywords: '취미 커뮤니티, 사람들, 실시간 채팅, 취미 자파리',
      path: '/people',
      image: DEFAULT_OG_IMAGE,
      schema: collectionPageSchema({
        name: `함께하는 사람들 - ${BRAND_NAME}`,
        description: '취미로 연결된 사람들의 이야기와 실시간 잡담을 만나보세요.',
        url: `${SITE_URL}/people`,
      }),
    };
  }

  if (path === '/events') {
    return {
      title: `이벤트 - ${BRAND_NAME}`,
      description:
        '취미를 더 즐겁게 만드는 다양한 이벤트와 챌린지에 참여해보세요. 취미 자파리 이벤트와 공모전을 확인해보세요.',
      keywords: '이벤트, 챌린지, 공모전, 취미 자파리',
      path: '/events',
      image: DEFAULT_OG_IMAGE,
      schema: collectionPageSchema({
        name: `이벤트 - ${BRAND_NAME}`,
        description: '취미를 더 즐겁게 만드는 다양한 이벤트와 챌린지에 참여해보세요.',
        url: `${SITE_URL}/events`,
      }),
    };
  }

  if (path === '/about') {
    return {
      title: `취미로 연결되는 아지트 - ${BRAND_NAME}`,
      description:
        '취미 자파리는 소소한 취미를 기록하고 나누는 따뜻한 커뮤니티입니다. 진입 장벽 없이 누구나 취미를 공유할 수 있어요.',
      keywords: '취미 자파리 소개, 취미 커뮤니티, 취미 기록',
      path: '/about',
      image: DEFAULT_OG_IMAGE,
      schema: organizationSchema(),
    };
  }

  // Non-indexable / private routes.
  if (path === '/auth') {
    return {
      title: `로그인 - ${BRAND_NAME}`,
      description: SITE_DESCRIPTION,
      path: null,
      robots: 'noindex, nofollow',
    };
  }

  if (path === '/my') {
    return {
      title: `내 정보 - ${BRAND_NAME}`,
      description: SITE_DESCRIPTION,
      path: null,
      robots: 'noindex, nofollow',
    };
  }

  if (path === '/write') {
    return {
      title: `글쓰기 - ${BRAND_NAME}`,
      description: SITE_DESCRIPTION,
      path: null,
      robots: 'noindex, nofollow',
    };
  }

  const categoryMatch = path.match(/^\/category\/([^/]+)$/);
  if (categoryMatch) {
    const slug = categoryMatch[1];
    const name = CATEGORY_NAMES[slug] ?? '취미';
    const description =
      CATEGORY_DESCRIPTIONS[slug] ?? `${name} 취미 이야기를 만나보세요. 취미 자파리 커뮤니티.`;
    return {
      title: `${name} - ${BRAND_NAME}`,
      description,
      keywords: `${name}, 취미, 취미 커뮤니티, 취미 자파리`,
      path: `/category/${slug}`,
      image: DEFAULT_OG_IMAGE,
      schema: collectionPageSchema({ name: `${name} - ${BRAND_NAME}`, description, url: `${SITE_URL}/category/${slug}` }),
    };
  }

  const boardWriteMatch = path.match(/^\/board\/([^/]+)\/write$/);
  if (boardWriteMatch) {
    return {
      title: `글쓰기 - ${BRAND_NAME}`,
      description: SITE_DESCRIPTION,
      path: null,
      robots: 'noindex, nofollow',
    };
  }

  const postMatch = path.match(/^\/board\/([^/]+)\/([^/]+)$/);
  if (postMatch) {
    return {
      title: `취미 이야기 - ${BRAND_NAME}`,
      description: '취미 자파리에서 취미 이야기와 기록을 만나보세요.',
      keywords: '취미 이야기, 취미 기록, 취미 자파리',
      path: `/board/${postMatch[1]}/${postMatch[2]}`,
      type: 'article',
      image: DEFAULT_OG_IMAGE,
    };
  }

  const boardMatch = path.match(/^\/board\/([^/]+)$/);
  if (boardMatch) {
    const slug = boardMatch[1];
    const name = BOARD_NAMES[slug] ?? '게시판';
    const description = `${name} 게시판의 최신 글을 확인하고 취미 이야기를 나눠보세요. 취미 자파리 커뮤니티.`;
    return {
      title: `${name} - ${BRAND_NAME}`,
      description,
      keywords: `${name}, 게시판, 취미, 취미 자파리`,
      path: `/board/${slug}`,
      image: DEFAULT_OG_IMAGE,
      schema: collectionPageSchema({ name: `${name} - ${BRAND_NAME}`, description, url: `${SITE_URL}/board/${slug}` }),
    };
  }

  // Fallback (404).
  return {
    title: `페이지를 찾을 수 없어요 - ${BRAND_NAME}`,
    description: SITE_DESCRIPTION,
    path: null,
    robots: 'noindex, nofollow',
  };
}