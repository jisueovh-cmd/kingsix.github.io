// 전국 지역 정보 허브 전용 상수와 헬퍼.
// 글의 tags(예: ['전국', '맛집', '강원'])에 분야 라벨과 권역 라벨을 저장한다.

import type { RegionGroupMeta, RegionHubConfig } from '@/lib/region';

export const NATION_SLUG = 'nation-region';
export const NATION_NAME = '전국 지역 정보';
export const NATION_TAG = '전국';
export const NATION_BOT_NAME = '산지기';

export type NationGroupKey =
  | 'metro'
  | 'gangwon'
  | 'chungcheong'
  | 'jeolla'
  | 'gyeongsang'
  | 'jeju'
  | 'island';

/** 전국 권역 그룹. 울릉도·독도까지 포함한다. */
export const NATION_GROUPS: RegionGroupMeta[] = [
  { key: 'metro', label: '수도권', icon: 'ri-building-4-line' },
  { key: 'gangwon', label: '강원', icon: 'ri-snowy-line' },
  { key: 'chungcheong', label: '충청', icon: 'ri-plant-line' },
  { key: 'jeolla', label: '전라', icon: 'ri-leaf-line' },
  { key: 'gyeongsang', label: '경상', icon: 'ri-ancient-gate-line' },
  { key: 'jeju', label: '제주', icon: 'ri-sailboat-line' },
  { key: 'island', label: '울릉도·독도', icon: 'ri-anchor-line' },
];

/** 전국 지역 정보 허브 구성. */
export const NATION_HUB: RegionHubConfig = {
  key: 'nation',
  slug: NATION_SLUG,
  name: NATION_NAME,
  tag: NATION_TAG,
  scopeAllLabel: '전국 전체',
  groups: NATION_GROUPS,
  hero: {
    image:
      'https://readdy.ai/api/search-image?query=Warm%20editorial%20flat%20illustration%20of%20a%20travel%20guide%20map%20of%20South%20Korea%20across%20all%20regions%20with%20mountains%2C%20coastlines%2C%20islands%2C%20temples%20and%20small%20shops%2C%20cream%20and%20terracotta%20and%20sage%20green%20palette%2C%20cozy%20magazine%20cover%20style&width=1600&height=900&seq=nation-region-hero&orientation=landscape',
    title: NATION_NAME,
    subtitle:
      '울릉도·독도까지, 수도권·강원·충청·전라·경상·제주 전 지역의 여행지·맛집·카페·나들이·축제 정보를 한곳에 모았어요. 어디로 떠날지 고민될 때 여기서 찾아보세요.',
    badges: [
      { icon: 'ri-live-line', label: 'LIVE', style: 'glass', pulse: true },
      { icon: 'ri-earth-line', label: '전국 8도', style: 'accent' },
    ],
    statRegionValue: '전국',
    statRegionLabel: '서비스 지역',
  },
  writeLabel: '직접 정보 올리기',
  listHeading: '지금 올라온 전국 지역 정보',
  generator: {
    title: 'AI 전국 지역 정보 자동 수집',
    description:
      '분야와 권역을 정하면 AI가 전국 곳곳의 여행지·맛집·나들이 정보를 한 번에 여러 개 모아 게시판에 바로 올려줘요. 최대 50개까지 채울 수 있어요.',
    notConfigured: 'AI 열쇠가 아직 연결되지 않았어요. 연결하면 AI가 전국 지역 정보를 모아줘요.',
    success: (count) => `AI가 전국 지역 정보 ${count}개를 새로 모았어요! 곳곳의 소식이 쌓이고 있어요.`,
    tip: "모은 글은 '산지기' 이름으로 등록되고, 언제든 자유롭게 수정하거나 지울 수 있어요.",
  },
  faq: [
    {
      question: '전국 지역 정보는 어떤 지역을 다루나요?',
      answer:
        '수도권(서울·경기·인천)부터 강원, 충청, 전라, 경상, 제주, 그리고 울릉도·독도까지 대한민국 전 지역의 여행지·맛집·나들이 정보를 모아요.',
    },
    {
      question: '울릉도·독도 정보도 있나요?',
      answer:
        '네, 울릉도와 독도를 별도 권역으로 두고 여행 정보, 배편, 볼거리, 먹거리까지 함께 모아드려요.',
    },
    {
      question: '전국 지역 정보는 어떻게 올리나요?',
      answer:
        '전국 지역 정보 게시판에서 누구나 직접 다녀온 여행지·맛집·나들이 정보를 올릴 수 있어요. 권역별로 나눠서 찾아보기도 쉬워요.',
    },
  ],
};