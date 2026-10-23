// 군포·수도권 지역 정보 허브 전용 상수와 헬퍼.
// 글의 tags(예: ['군포·수도권', '맛집', '군포'])에 분야 라벨과 지역 그룹 라벨을 저장한다.

export const REGION_SLUG = 'gunpo-region';
export const REGION_NAME = '군포·수도권 지역 정보';
export const REGION_TAG = '군포·수도권';
export const REGION_BOT_NAME = '산지기';

export const REGION_MIN_COUNT = 3;
export const REGION_MAX_COUNT = 50;

export type RegionCategoryKey =
  | 'attraction'
  | 'food'
  | 'cafe'
  | 'walk'
  | 'festival'
  | 'local';

export type RegionTone = 'primary' | 'accent' | 'secondary';

export interface RegionPost {
  id: string;
  title: string;
  content: string | null;
  author_name: string;
  location: string | null;
  tags: string[] | null;
  view_count: number;
  created_at: string;
}

export interface RegionCategoryMeta {
  key: RegionCategoryKey;
  label: string;
  tagline: string;
  icon: string;
  tone: RegionTone;
  image: string;
}

/** 수도권 권역 그룹. 군포를 가장 앞에 두고 우선 노출한다. */
export type RegionGroupKey = 'gunpo' | 'gyeonggi' | 'seoul' | 'incheon';

export interface RegionGroupMeta {
  key: string;
  label: string;
  icon: string;
}

export const REGION_GROUPS: RegionGroupMeta[] = [
  { key: 'gunpo', label: '군포', icon: 'ri-map-pin-2-line' },
  { key: 'gyeonggi', label: '경기', icon: 'ri-building-2-line' },
  { key: 'seoul', label: '서울', icon: 'ri-building-4-line' },
  { key: 'incheon', label: '인천', icon: 'ri-sailboat-line' },
];

/** 수도권 권역의 시/구와 대표 동네 목록. 군포를 최우선으로 담는다. */
export interface RegionArea {
  name: string;
  group: RegionGroupKey;
  hoods: string[];
}

export const REGION_AREAS: RegionArea[] = [
  // --- 군포 우선 ---
  {
    name: '군포시',
    group: 'gunpo',
    hoods: ['산본동', '금정동', '당동', '부곡동', '대야미동', '속달동', '도마교동', '둔대동'],
  },

  // --- 경기 ---
  { name: '수원시', group: 'gyeonggi', hoods: ['영통동', '인계동', '정자동', '행궁동', '화서동', '권선동'] },
  { name: '성남시', group: 'gyeonggi', hoods: ['판교동', '야탑동', '분당동', '수내동', '위례동'] },
  { name: '안양시', group: 'gyeonggi', hoods: ['평촌동', '범계동', '관양동', '만안동', '박달동'] },
  { name: '안산시', group: 'gyeonggi', hoods: ['고잔동', '중앙동', '단원동', '상록수동', '선부동'] },
  { name: '의왕시', group: 'gyeonggi', hoods: ['내손동', '포일동', '오전동', '청계동', '왕곡동'] },
  { name: '과천시', group: 'gyeonggi', hoods: ['중앙동', '별양동', '갈현동', '문원동'] },
  { name: '시흥시', group: 'gyeonggi', hoods: ['정왕동', '배곧동', '은행동', '대야동', '월곶동'] },
  { name: '광명시', group: 'gyeonggi', hoods: ['철산동', '하안동', '일직동', '소하동'] },
  { name: '부천시', group: 'gyeonggi', hoods: ['상동', '중동', '심곡동', '역곡동', '송내동'] },
  { name: '용인시', group: 'gyeonggi', hoods: ['수지동', '기흥동', '처인동', '동백동'] },
  { name: '화성시', group: 'gyeonggi', hoods: ['동탄동', '병점동', '향남읍', '봉담읍', '남양읍'] },
  { name: '평택시', group: 'gyeonggi', hoods: ['비전동', '평택동', '동삭동', '송탄동'] },
  { name: '오산시', group: 'gyeonggi', hoods: ['오산동', '원동', '궐동', '부산동'] },
  { name: '고양시', group: 'gyeonggi', hoods: ['일산동', '주엽동', '화정동', '원당동', '탄현동'] },
  { name: '남양주시', group: 'gyeonggi', hoods: ['다산동', '별내동', '와부읍', '호평동'] },
  { name: '하남시', group: 'gyeonggi', hoods: ['미사동', '망월동', '덕풍동', '감일동'] },
  { name: '광주시', group: 'gyeonggi', hoods: ['경안동', '오포읍', '곤지암읍', '초월읍'] },
  { name: '김포시', group: 'gyeonggi', hoods: ['장기동', '구래동', '사우동', '풍무동'] },

  // --- 서울 ---
  { name: '종로구', group: 'seoul', hoods: ['삼청동', '익선동', '북촌', '서촌', '광장시장'] },
  { name: '중구', group: 'seoul', hoods: ['명동', '을지로', '충무로', '남대문'] },
  { name: '용산구', group: 'seoul', hoods: ['이태원', '한남동', '경리단길', '용리단길'] },
  { name: '마포구', group: 'seoul', hoods: ['연남동', '망원동', '홍대', '합정동'] },
  { name: '서대문구', group: 'seoul', hoods: ['연희동', '신촌', '북가좌동'] },
  { name: '성동구', group: 'seoul', hoods: ['성수동', '서울숲', '왕십리'] },
  { name: '광진구', group: 'seoul', hoods: ['건대입구', '자양동', '뚝섬'] },
  { name: '강남구', group: 'seoul', hoods: ['압구정동', '신사동', '가로수길', '청담동'] },
  { name: '서초구', group: 'seoul', hoods: ['반포동', '교대', '양재동'] },
  { name: '송파구', group: 'seoul', hoods: ['잠실동', '석촌호수', '문정동'] },
  { name: '영등포구', group: 'seoul', hoods: ['여의도', '문래동', '당산동'] },
  { name: '동작구', group: 'seoul', hoods: ['노량진', '사당동', '흑석동'] },

  // --- 인천 ---
  { name: '인천 중구', group: 'incheon', hoods: ['월미도', '차이나타운', '개항장', '송월동'] },
  { name: '인천 연수구', group: 'incheon', hoods: ['송도동', '연수동', '청학동'] },
  { name: '인천 남동구', group: 'incheon', hoods: ['구월동', '소래포구', '논현동'] },
  { name: '인천 부평구', group: 'incheon', hoods: ['부평동', '갈산동', '삼산동'] },
  { name: '인천 서구', group: 'incheon', hoods: ['청라동', '검단동', '가정동'] },
  { name: '인천 미추홀구', group: 'incheon', hoods: ['문학동', '주안동', '용현동'] },
];

const GROUP_LABEL_BY_KEY = new Map(REGION_GROUPS.map((g) => [g.key, g.label]));

export function regionGroupLabel(key: RegionGroupKey): string {
  return GROUP_LABEL_BY_KEY.get(key) ?? '';
}

export const REGION_CATEGORIES: RegionCategoryMeta[] = [
  {
    key: 'attraction',
    label: '여행지·명소',
    tagline: '가볼 만한 곳과 숨은 명소',
    icon: 'ri-map-pin-2-line',
    tone: 'primary',
    image:
      'https://readdy.ai/api/search-image?query=Warm%20flat%20illustration%20of%20a%20scenic%20korean%20mountain%20trail%20and%20lakeside%20park%20with%20hikers%20and%20a%20wooden%20boardwalk%2C%20cream%20and%20sage%20green%20and%20terracotta%20palette%2C%20cozy%20editorial%20travel%20illustration&width=800&height=600&seq=gunpo-region-attraction&orientation=landscape',
  },
  {
    key: 'food',
    label: '맛집',
    tagline: '동네 맛집과 오늘의 한 끼',
    icon: 'ri-restaurant-2-line',
    tone: 'accent',
    image:
      'https://readdy.ai/api/search-image?query=Warm%20flat%20illustration%20of%20a%20cozy%20korean%20restaurant%20table%20with%20steaming%20bowls%20of%20noodles%20side%20dishes%20and%20chopsticks%2C%20cream%20and%20terracotta%20palette%2C%20appetizing%20editorial%20food%20illustration&width=800&height=600&seq=gunpo-region-food&orientation=landscape',
  },
  {
    key: 'cafe',
    label: '카페·데이트',
    tagline: '분위기 좋은 카페와 코스',
    icon: 'ri-cup-line',
    tone: 'secondary',
    image:
      'https://readdy.ai/api/search-image?query=Warm%20flat%20illustration%20of%20a%20cozy%20korean%20cafe%20with%20latte%20cups%20and%20cake%20on%20a%20wooden%20table%20by%20a%20sunny%20window%2C%20cream%20and%20caramel%20and%20sage%20green%20palette%2C%20editorial%20illustration&width=800&height=600&seq=gunpo-region-cafe&orientation=landscape',
  },
  {
    key: 'walk',
    label: '산책·나들이',
    tagline: '걷기 좋은 길과 나들이 코스',
    icon: 'ri-walk-line',
    tone: 'accent',
    image:
      'https://readdy.ai/api/search-image?query=Warm%20flat%20illustration%20of%20a%20peaceful%20lakeside%20walking%20path%20with%20trees%20a%20bench%20and%20strolling%20people%2C%20cream%20and%20sage%20green%20and%20terracotta%20palette%2C%20relaxing%20editorial%20illustration&width=800&height=600&seq=gunpo-region-walk&orientation=landscape',
  },
  {
    key: 'festival',
    label: '축제·행사',
    tagline: '이번 달 열리는 축제와 행사',
    icon: 'ri-calendar-event-line',
    tone: 'primary',
    image:
      'https://readdy.ai/api/search-image?query=Warm%20flat%20illustration%20of%20a%20lively%20korean%20local%20street%20festival%20with%20lanterns%20tents%20and%20crowds%2C%20cream%20and%20amber%20and%20terracotta%20palette%2C%20festive%20editorial%20illustration&width=800&height=600&seq=gunpo-region-festival&orientation=landscape',
  },
  {
    key: 'local',
    label: '지역 소식·광고',
    tagline: '새로 연 가게와 동네 소식',
    icon: 'ri-megaphone-line',
    tone: 'secondary',
    image:
      'https://readdy.ai/api/search-image?query=Warm%20flat%20illustration%20of%20a%20friendly%20korean%20neighborhood%20shopping%20street%20with%20small%20shops%20and%20banners%2C%20cream%20and%20terracotta%20and%20sage%20green%20palette%2C%20cozy%20community%20editorial%20illustration&width=800&height=600&seq=gunpo-region-local&orientation=landscape',
  },
];

const CATEGORY_BY_LABEL = new Map(REGION_CATEGORIES.map((c) => [c.label, c]));

export function regionCategoryByLabel(label: string | null | undefined): RegionCategoryMeta {
  if (label && CATEGORY_BY_LABEL.has(label)) return CATEGORY_BY_LABEL.get(label) as RegionCategoryMeta;
  return REGION_CATEGORIES[0];
}

/** 글의 tags(['군포·수도권', '맛집', '군포'])에서 분야를 찾아 반환한다. */
export function regionCategoryFromTags(tags: string[] | null | undefined): RegionCategoryMeta {
  if (!tags || tags.length === 0) return REGION_CATEGORIES[0];
  for (const tag of tags) {
    const hit = CATEGORY_BY_LABEL.get(tag);
    if (hit) return hit;
  }
  return REGION_CATEGORIES[0];
}

// ==========================================================================
// 지역 정보 허브 구성: 군포·수도권 / 전국이 같은 컴포넌트를 공유한다.
// ==========================================================================

export type RegionHubKey = 'gunpo' | 'nation';

export interface RegionHubBadge {
  icon: string;
  label: string;
  style: 'glass' | 'accent';
  pulse?: boolean;
}

export interface RegionHubConfig {
  key: RegionHubKey;
  slug: string;
  name: string;
  tag: string;
  scopeAllLabel: string;
  groups: RegionGroupMeta[];
  hero: {
    image: string;
    title: string;
    subtitle: string;
    badges: RegionHubBadge[];
    statRegionValue: string;
    statRegionLabel: string;
  };
  writeLabel: string;
  listHeading: string;
  generator: {
    title: string;
    description: string;
    notConfigured: string;
    success: (count: number) => string;
    tip: string;
  };
  faq: { question: string; answer: string }[];
}

/** 군포·수도권 지역 정보 허브 구성. */
export const GUNPO_HUB: RegionHubConfig = {
  key: 'gunpo',
  slug: REGION_SLUG,
  name: REGION_NAME,
  tag: REGION_TAG,
  scopeAllLabel: '수도권 전체',
  groups: REGION_GROUPS,
  hero: {
    image:
      'https://readdy.ai/api/search-image?query=Warm%20editorial%20flat%20illustration%20of%20a%20travel%20guide%20map%20of%20Gunpo%20and%20the%20Seoul%20metropolitan%20area%20with%20classic%20landmarks%2C%20a%20lake%20park%2C%20small%20shops%20and%20mountain%20trails%2C%20cream%20and%20terracotta%20and%20sage%20green%20palette%2C%20cozy%20magazine%20cover%20style&width=1600&height=900&seq=gunpo-region-hero&orientation=landscape',
    title: REGION_NAME,
    subtitle:
      '군포를 먼저, 그리고 서울·인천·경기 수도권의 여행지·맛집·카페·나들이·축제 정보를 한곳에 모았어요. 새로 연 가게나 동네 소식까지 함께 챙겨요.',
    badges: [
      { icon: 'ri-live-line', label: 'LIVE', style: 'glass', pulse: true },
      { icon: 'ri-map-pin-2-fill', label: '군포 우선', style: 'accent' },
    ],
    statRegionValue: '수도권',
    statRegionLabel: '서비스 지역',
  },
  writeLabel: '직접 정보 올리기',
  listHeading: '지금 올라온 지역 정보',
  generator: {
    title: 'AI 지역 정보 자동 수집',
    description:
      '분야와 지역을 정하면 AI가 군포를 우선으로 수도권 여행지·맛집·나들이 정보를 한 번에 여러 개 모아 게시판에 바로 올려줘요. 최대 50개까지 채울 수 있어요.',
    notConfigured: 'AI 열쇠가 아직 연결되지 않았어요. 연결하면 AI가 군포·수도권 지역 정보를 모아줘요.',
    success: (count) =>
      `AI가 지역 정보 ${count}개를 새로 모았어요! 군포 소식이 점점 쌓이고 있어요.`,
    tip: "모은 글은 '산지기' 이름으로 등록되고, 언제든 자유롭게 수정하거나 지울 수 있어요.",
  },
  faq: [
    {
      question: '군포·수도권 지역 정보는 어떤 내용을 모으나요?',
      answer:
        '군포를 우선으로 서울·인천·경기 수도권의 여행지·명소, 맛집, 카페·데이트, 산책·나들이, 축제·행사, 그리고 새로 연 가게 같은 지역 소식까지 한곳에 모아요.',
    },
    {
      question: '지역 정보는 어떻게 올리나요?',
      answer:
        '지역 정보 게시판에서 누구나 직접 다녀온 여행지·맛집·나들이 정보를 올릴 수 있어요. 사진과 함께 구체적으로 적어주시면 다른 분들에게 큰 도움이 돼요.',
    },
    {
      question: '군포 정보도 함께 볼 수 있나요?',
      answer:
        '네, 군포(산본·금정·당동·부곡 등)를 가장 먼저 보여드리고, 경기·서울·인천 순으로 수도권 전 지역 정보를 함께 볼 수 있어요.',
    },
  ],
};

export const REGION_TONE_CLASSES: Record<
  RegionTone,
  { bubble: string; chip: string; chipActive: string; ring: string }
> = {
  primary: {
    bubble: 'bg-primary-100 text-primary-700',
    chip: 'border-primary-200 bg-primary-50 text-primary-800 hover:border-primary-300',
    chipActive: 'border-primary-500 bg-primary-500 text-background-50',
    ring: 'hover:border-primary-300',
  },
  accent: {
    bubble: 'bg-accent-100 text-accent-700',
    chip: 'border-accent-200 bg-accent-50 text-accent-800 hover:border-accent-300',
    chipActive: 'border-accent-500 bg-accent-500 text-background-50',
    ring: 'hover:border-accent-300',
  },
  secondary: {
    bubble: 'bg-secondary-100 text-secondary-800',
    chip: 'border-secondary-200 bg-secondary-50 text-secondary-900 hover:border-secondary-300',
    chipActive: 'border-secondary-500 bg-secondary-500 text-background-50',
    ring: 'hover:border-secondary-300',
  },
};