import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BOT_NAME = '산지기';

const CATEGORY_LABELS: Record<string, string> = {
  attraction: '여행지·명소',
  food: '맛집',
  cafe: '카페·데이트',
  walk: '산책·나들이',
  festival: '축제·행사',
  local: '지역 소식·광고',
};

const ALL_CATEGORY_LABELS = Object.values(CATEGORY_LABELS);

const BATCH_SIZE = 10;
const MAX_COUNT = 50;

interface AreaDef {
  name: string;
  group: string;
  hoods: string[];
}

interface HubDef {
  boardSlug: string;
  tag: string;
  scopeWord: string;
  groupLabels: Record<string, string>;
  areas: AreaDef[];
  priorityHint: string;
}

// --- 군포·수도권 허브 ---
const GUNPO_AREAS: AreaDef[] = [
  { name: '군포시', group: 'gunpo', hoods: ['산본동', '금정동', '당동', '부곡동', '대야미동', '속달동', '도마교동', '둔대동'] },
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
  { name: '인천 중구', group: 'incheon', hoods: ['월미도', '차이나타운', '개항장', '송월동'] },
  { name: '인천 연수구', group: 'incheon', hoods: ['송도동', '연수동', '청학동'] },
  { name: '인천 남동구', group: 'incheon', hoods: ['구월동', '소래포구', '논현동'] },
  { name: '인천 부평구', group: 'incheon', hoods: ['부평동', '갈산동', '삼산동'] },
  { name: '인천 서구', group: 'incheon', hoods: ['청라동', '검단동', '가정동'] },
  { name: '인천 미추홀구', group: 'incheon', hoods: ['문학동', '주안동', '용현동'] },
];

// --- 전국 허브 ---
const NATION_AREAS: AreaDef[] = [
  // 수도권
  { name: '서울 종로구', group: 'metro', hoods: ['삼청동', '익선동', '북촌', '서촌'] },
  { name: '서울 마포구', group: 'metro', hoods: ['연남동', '망원동', '홍대', '합정동'] },
  { name: '서울 성동구', group: 'metro', hoods: ['성수동', '서울숲', '왕십리'] },
  { name: '서울 송파구', group: 'metro', hoods: ['잠실동', '석촌호수', '문정동'] },
  { name: '경기 수원시', group: 'metro', hoods: ['행궁동', '영통동', '인계동'] },
  { name: '경기 고양시', group: 'metro', hoods: ['일산동', '화정동', '탄현동'] },
  { name: '경기 가평군', group: 'metro', hoods: ['청평면', '북면', '남이섬'] },
  { name: '인천 중구', group: 'metro', hoods: ['월미도', '차이나타운', '개항장'] },
  { name: '인천 연수구', group: 'metro', hoods: ['송도동', '연수동', '청학동'] },
  // 강원
  { name: '강원 춘천시', group: 'gangwon', hoods: ['신동면', '명동', '소양로'] },
  { name: '강원 원주시', group: 'gangwon', hoods: ['반곡동', '단계동', '무실동'] },
  { name: '강원 강릉시', group: 'gangwon', hoods: ['안목동', '주문진읍', '경포동'] },
  { name: '강원 속초시', group: 'gangwon', hoods: ['중앙동', '조양동', '청호동'] },
  { name: '강원 양양군', group: 'gangwon', hoods: ['양양읍', '현남면', '죽도'] },
  { name: '강원 평창군', group: 'gangwon', hoods: ['대관령면', '봉평면', '진부면'] },
  { name: '강원 정선군', group: 'gangwon', hoods: ['정선읍', '고한읍', '임계면'] },
  { name: '강원 삼척시', group: 'gangwon', hoods: ['장미동', '원덕읍', '근덕면'] },
  { name: '강원 인제군', group: 'gangwon', hoods: ['인제읍', '북면', '기린면'] },
  // 충청
  { name: '충북 청주시', group: 'chungcheong', hoods: ['성안동', '복대동', '운천동'] },
  { name: '충북 충주시', group: 'chungcheong', hoods: ['성내동', '호암동', '달천동'] },
  { name: '충북 제천시', group: 'chungcheong', hoods: ['청전동', '의림동', '수산면'] },
  { name: '충북 단양군', group: 'chungcheong', hoods: ['단양읍', '매포읍', '가곡면'] },
  { name: '충남 천안시', group: 'chungcheong', hoods: ['불당동', '신부동', '두정동'] },
  { name: '충남 공주시', group: 'chungcheong', hoods: ['중동', '금성동', '무령로'] },
  { name: '충남 부여군', group: 'chungcheong', hoods: ['부여읍', '규암면', '궁남로'] },
  { name: '충남 태안군', group: 'chungcheong', hoods: ['태안읍', '안면읍', '소원면'] },
  { name: '대전 유성구', group: 'chungcheong', hoods: ['봉명동', '온천동', '도룡동'] },
  { name: '세종시', group: 'chungcheong', hoods: ['조치원읍', '한솔동', '도담동'] },
  // 전라
  { name: '전북 전주시', group: 'jeolla', hoods: ['완산구', '덕진구', '한옥마을'] },
  { name: '전북 군산시', group: 'jeolla', hoods: ['근대역사박물관', '월명동', '선유도'] },
  { name: '전북 남원시', group: 'jeolla', hoods: ['광한루', '도통동', '산내면'] },
  { name: '전남 목포시', group: 'jeolla', hoods: ['유달동', '평화광장', '삼학도'] },
  { name: '전남 여수시', group: 'jeolla', hoods: ['돌산읍', '소호동', '종화동'] },
  { name: '전남 순천시', group: 'jeolla', hoods: ['조례동', '순천만', '낙안면'] },
  { name: '전남 담양군', group: 'jeolla', hoods: ['담양읍', '죽녹원', '가사문학면'] },
  { name: '전남 완도군', group: 'jeolla', hoods: ['완도읍', '청산면', '신지면'] },
  { name: '광주 동구', group: 'jeolla', hoods: ['동명동', '충장로', '양림동'] },
  // 경상
  { name: '부산 영도구', group: 'gyeongsang', hoods: ['흰여울문화마을', '동삼동', '청학동'] },
  { name: '부산 해운대구', group: 'gyeongsang', hoods: ['해운대해수욕장', '달맞이길', '송정동'] },
  { name: '대구 중구', group: 'gyeongsang', hoods: ['동성로', '김광석길', '삼덕동'] },
  { name: '울산 남구', group: 'gyeongsang', hoods: ['태화동', '삼산동', '간절곶'] },
  { name: '경북 경주시', group: 'gyeongsang', hoods: ['황남동', '황리단길', '불국동'] },
  { name: '경북 포항시', group: 'gyeongsang', hoods: ['북구', '남구', '호미곶'] },
  { name: '경북 안동시', group: 'gyeongsang', hoods: ['하회마을', '중앙동', '월영교'] },
  { name: '경남 창원시', group: 'gyeongsang', hoods: ['상남동', '성산구', '마산합포구'] },
  { name: '경남 진주시', group: 'gyeongsang', hoods: ['이현동', '진주성', '남강'] },
  { name: '경남 통영시', group: 'gyeongsang', hoods: ['중앙동', '강구안', '미륵도'] },
  { name: '경남 거제시', group: 'gyeongsang', hoods: ['고현동', '장목면', '둔덕면'] },
  { name: '경남 남해군', group: 'gyeongsang', hoods: ['남해읍', '독일마을', '상주면'] },
  // 제주
  { name: '제주 제주시', group: 'jeju', hoods: ['애월읍', '한림읍', '이도동'] },
  { name: '제주 서귀포시', group: 'jeju', hoods: ['성산읍', '중문동', '대정읍'] },
  { name: '제주 우도', group: 'jeju', hoods: ['우도면', '서빈백사', '하고수동'] },
  // 울릉도·독도
  { name: '경북 울릉군', group: 'island', hoods: ['울릉읍', '북면', '서면', '나리분지', '봉래폭포'] },
  { name: '경북 독도', group: 'island', hoods: ['독도', '동도', '서도'] },
];

const HUBS: Record<string, HubDef> = {
  gunpo: {
    boardSlug: 'gunpo-region',
    tag: '군포·수도권',
    scopeWord: '군포·수도권',
    groupLabels: { gunpo: '군포', gyeonggi: '경기', seoul: '서울', incheon: '인천' },
    areas: GUNPO_AREAS,
    priorityHint:
      '군포를 가장 우선으로 하되, 전체의 절반 정도는 군포 지역으로 채우고 나머지는 수도권(서울·인천·경기)으로 섞어줘.',
  },
  nation: {
    boardSlug: 'nation-region',
    tag: '전국',
    scopeWord: '전국',
    groupLabels: {
      metro: '수도권',
      gangwon: '강원',
      chungcheong: '충청',
      jeolla: '전라',
      gyeongsang: '경상',
      jeju: '제주',
      island: '울릉도·독도',
    },
    areas: NATION_AREAS,
    priorityHint:
      '수도권·강원·충청·전라·경상·제주·울릉도·독도 권역을 최대한 골고루 섞어줘. 특정 권역에 몰리지 않게 해줘.',
  },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// AI 글쓰기(게시판에 글 넣기)를 허용하는 관리자 이메일 목록.
// 기본값은 사이트 소유자이며, 바꾸려면 Supabase Secrets의 ADMIN_EMAILS(쉼표 구분)로 덮어쓴다.
const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') ?? 'gisueovh7@naver.com')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

/**
 * 호출자의 JWT를 검증해 관리자 이메일인지 확인한다.
 * auth.getUser는 반드시 anon 키 클라이언트로만 호출한다(서비스 롤 클라이언트로는 호출하지 않는다).
 */
async function isAuthorizedCaller(req: Request, supabaseUrl: string): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  const anonKey =
    Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';
  if (!anonKey) return false;

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  const email = data?.user?.email?.trim().toLowerCase() ?? '';
  if (error || !email) return false;
  return ADMIN_EMAILS.includes(email);
}

interface GeneratedItem {
  title?: string;
  content?: string;
  location?: string;
}

function clampText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

function areasForGroup(hub: HubDef, area: string): AreaDef[] {
  if (area === 'all') return hub.areas;
  const list = hub.areas.filter((a) => a.group === area);
  return list.length > 0 ? list : hub.areas;
}

/** 이번 묶음에서 강조할 지역 몇 곳을 배치마다 돌아가며 고른다. */
function areaHintForBatch(pool: AreaDef[], batchIndex: number): string {
  const picked: string[] = [];
  const take = Math.min(4, pool.length);
  for (let i = 0; i < take; i += 1) {
    picked.push(pool[(batchIndex * 3 + i) % pool.length].name);
  }
  return picked.join(', ');
}

function fallbackArea(pool: AreaDef[], index: number) {
  const area = pool[index % pool.length];
  const hood = area.hoods[index % area.hoods.length];
  return { location: `${area.name} ${hood}`, group: area.group };
}

function resolveGroup(location: string, hub: HubDef, fallback: string): string {
  const hit = hub.areas.find((a) => location.startsWith(a.name));
  if (hit) return hit.group;
  if (location.includes('울릉') || location.includes('독도')) return 'island';
  if (location.includes('제주')) return 'jeju';
  if (location.includes('강원')) return 'gangwon';
  if (
    location.includes('충청') ||
    location.includes('충북') ||
    location.includes('충남') ||
    location.includes('대전') ||
    location.includes('세종')
  ) {
    return 'chungcheong';
  }
  if (
    location.includes('전라') ||
    location.includes('전북') ||
    location.includes('전남') ||
    location.includes('광주')
  ) {
    return 'jeolla';
  }
  if (
    location.includes('경상') ||
    location.includes('경북') ||
    location.includes('경남') ||
    location.includes('부산') ||
    location.includes('대구') ||
    location.includes('울산')
  ) {
    return 'gyeongsang';
  }
  if (hub.scopeWord === '전국') return 'metro';
  return fallback;
}

async function generateBatch(
  apiKey: string,
  hub: HubDef,
  categoryLabels: string[],
  pool: AreaDef[],
  areaKey: string,
  batchCount: number,
  batchIndex: number,
): Promise<GeneratedItem[]> {
  const isMixed = categoryLabels.length > 1;
  const categoryText = isMixed ? ALL_CATEGORY_LABELS.join(', ') : categoryLabels[0];

  const areaOrderHint =
    areaKey === 'all'
      ? hub.priorityHint
      : '위에 주어진 지역 안에서만 골라줘.';

  const areaListText = pool.map((a) => `${a.name}(${a.hoods.join(', ')})`).join(' / ');

  const systemPrompt =
    `너는 ${hub.scopeWord} 지역 정보를 정리해 커뮤니티 게시판에 올리는 지역 정보 큐레이터다. ` +
    '실제 주민이나 여행자가 직접 다녀오고 정리한 것처럼, 여행지·맛집·카페·나들이·축제에 대한 사실적이고 도움이 되는 정보를 자연스럽게 쓴다. ' +
    '과장이나 허위는 쓰지 않고, 실제로 있을 법한 장소와 구체적인 팁(위치, 영업시간, 가격대, 가는 길)을 담는다. 반드시 한국어로만 작성한다.';

  const userPrompt = [
    `${hub.scopeWord} 지역의 '${categoryText}' 정보글 ${batchCount}개를 작성해줘.`,
    '',
    '사용할 수 있는 지역(도시·군(동네들)):',
    areaListText,
    `이번 묶음에서는 특히 ${areaHintForBatch(pool, batchIndex)} 지역을 골고루 포함해줘.`,
    areaOrderHint,
    '',
    '조건:',
    '- 제목은 40자 이내, 어떤 지역의 어떤 장소/정보인지 드러나게.',
    '- 본문은 2~4문장, 150~320자 정도로 구체적으로. 실제 방문 팁(위치·시간·가격·추천 포인트)을 포함.',
    '- location은 "OO시 OO동" 또는 "OO도 OO시 OO동" 형식으로, 위 지역 목록의 도시와 동네만 사용.',
    '- 각 글은 서로 완전히 다른 장소/내용이어야 하고, 가능하면 한 장소를 여러 번 쓰지 않는다.',
    '- 여행지·맛집 같은 정보성 내용 위주로 쓰고, 광고성 글은 최소화한다.',
    isMixed ? '- 6개 분야(여행지·명소/맛집/카페·데이트/산책·나들이/축제·행사/지역 소식·광고)를 골고루 섞어줘.' : '',
    '',
    '아래 JSON 형식으로만 답해줘:',
    '{ "items": [ { "title": "제목", "content": "본문", "location": "서울 마포구 연남동" } ] }',
  ]
    .filter(Boolean)
    .join('\n');

  const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.95,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!aiRes.ok) {
    const detail = await aiRes.text();
    throw new Error(`AI_REQUEST_FAILED:${detail.slice(0, 200)}`);
  }

  const aiData = await aiRes.json();
  const rawContent = aiData?.choices?.[0]?.message?.content ?? '';
  let parsed: { items?: GeneratedItem[]; ads?: GeneratedItem[] } = {};
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return [];
  }
  const list = parsed.items ?? parsed.ads ?? [];
  return Array.isArray(list) ? list : [];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'SERVER_ENV_MISSING' }, 500);
    }

    if (!apiKey) {
      return json({ error: 'AI_NOT_CONFIGURED' });
    }

    // AI 글쓰기는 관리자(소유자)만 가능하다. 그 외 계정은 글이 만들어지지 않는다.
    const authorized = await isAuthorizedCaller(req, supabaseUrl);
    if (!authorized) {
      return json(
        { error: 'FORBIDDEN', message: 'AI 글쓰기는 관리자만 쓸 수 있어요.' },
        403,
      );
    }

    let body: { category?: string; area?: string; count?: number; scope?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const scope = body.scope === 'nation' ? 'nation' : 'gunpo';
    const hub = HUBS[scope];

    const categoryKey = typeof body.category === 'string' ? body.category : 'all';
    const categoryLabels =
      categoryKey === 'all'
        ? ALL_CATEGORY_LABELS
        : [CATEGORY_LABELS[categoryKey] ?? CATEGORY_LABELS.attraction];
    const primaryLabel = categoryLabels[0];

    const areaKey = typeof body.area === 'string' ? body.area : 'all';
    const pool = areasForGroup(hub, areaKey);

    const rawCount = Number(body.count);
    const count = Number.isFinite(rawCount)
      ? Math.min(Math.max(Math.trunc(rawCount), 1), MAX_COUNT)
      : 5;

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('slug', hub.boardSlug)
      .maybeSingle();
    if (boardError || !board) {
      return json({ error: 'BOARD_NOT_FOUND' }, 404);
    }

    const batches = Math.ceil(count / BATCH_SIZE);
    const collected: GeneratedItem[] = [];
    for (let b = 0; b < batches; b += 1) {
      const remaining = count - collected.length;
      if (remaining <= 0) break;
      const batchCount = Math.min(BATCH_SIZE, remaining);
      try {
        const items = await generateBatch(apiKey, hub, categoryLabels, pool, areaKey, batchCount, b);
        collected.push(...items);
      } catch (err) {
        if (collected.length === 0) {
          return json({ error: 'AI_REQUEST_FAILED', message: String(err).slice(0, 300) }, 502);
        }
        break;
      }
    }

    const rows = collected
      .slice(0, count)
      .map((item, index) => {
        const title = clampText(item.title, 80);
        const content = clampText(item.content, 900);
        if (!title || !content) return null;
        const fallback = fallbackArea(pool, index);
        const locationText = clampText(item.location, 40) || fallback.location;
        const group = resolveGroup(locationText, hub, fallback.group);
        const groupLabel = hub.groupLabels[group] ?? Object.values(hub.groupLabels)[0];
        return {
          board_id: board.id,
          title,
          content,
          author_name: BOT_NAME,
          content_type: 'place',
          location: locationText,
          tags: [hub.tag, primaryLabel, groupLabel],
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (rows.length === 0) {
      return json({ error: 'AI_EMPTY_RESULT' }, 502);
    }

    const { data: inserted, error: insertError } = await supabase
      .from('posts')
      .insert(rows)
      .select('id');
    if (insertError) {
      return json({ error: 'INSERT_FAILED', message: insertError.message }, 500);
    }

    return json({ inserted: inserted?.length ?? rows.length, category: primaryLabel, scope });
  } catch (err) {
    return json({ error: 'UNEXPECTED', message: String(err) }, 500);
  }
});
