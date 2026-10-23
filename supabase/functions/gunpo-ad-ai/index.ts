import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BOARD_SLUG = 'local-ads';
const BOT_NAME = '경기남부광고봇';
const REGION_TAG = '경기남부';

const CITIES: { name: string; hoods: string[] }[] = [
  { name: '수원시', hoods: ['영통동', '인계동', '정자동', '매탄동', '화서동', '권선동'] },
  { name: '안양시', hoods: ['평촌동', '범계동', '관양동', '호계동', '박달동'] },
  { name: '안산시', hoods: ['고잔동', '중앙동', '단원동', '상록수동', '선부동'] },
  { name: '군포시', hoods: ['산본동', '금정동', '당동', '부곡동', '대야미동', '속달동'] },
  { name: '의왕시', hoods: ['내손동', '포일동', '오전동', '청계동'] },
  { name: '과천시', hoods: ['중앙동', '별양동', '갈현동', '문원동'] },
  { name: '시흥시', hoods: ['정왕동', '배곧동', '은행동', '대야동'] },
  { name: '광명시', hoods: ['철산동', '하안동', '일직동', '소하동'] },
  { name: '오산시', hoods: ['오산동', '원동', '궐동', '부산동'] },
  { name: '평택시', hoods: ['비전동', '평택동', '동삭동', '송탄동'] },
  { name: '화성시', hoods: ['동탄동', '병점동', '향남읍', '봉담읍'] },
  { name: '성남시', hoods: ['판교동', '야탑동', '분당동', '수내동'] },
];

const CITY_LIST_TEXT = CITIES.map((c) => `${c.name}(${c.hoods.join(', ')})`).join(' / ');

const CATEGORY_LABELS: Record<string, string> = {
  business: '업체 홍보',
  deal: '할인·이벤트',
  recruit: '구인구직',
  gather: '모임·모집',
  realestate: '부동산',
  secondhand: '중고거래',
};

const ALL_CATEGORY_LABELS = Object.values(CATEGORY_LABELS);

const BATCH_SIZE = 10;
const MAX_COUNT = 50;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// AI 광고 글쓰기(게시판에 글 넣기)를 허용하는 관리자 이메일 목록.
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

interface GeneratedAd {
  title?: string;
  content?: string;
  location?: string;
}

function clampText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

/** 이번 묶음에서 강조할 도시 4곳을 배치마다 돌아가며 고른다. */
function cityHintForBatch(batchIndex: number): string {
  const picked: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    picked.push(CITIES[(batchIndex * 3 + i) % CITIES.length].name);
  }
  return picked.join(', ');
}

function fallbackLocation(index: number): string {
  const city = CITIES[index % CITIES.length];
  const hood = city.hoods[index % city.hoods.length];
  return `${city.name} ${hood}`;
}

async function generateBatch(
  apiKey: string,
  categoryLabels: string[],
  batchCount: number,
  batchIndex: number,
): Promise<GeneratedAd[]> {
  const isMixed = categoryLabels.length > 1;
  const categoryText = isMixed ? ALL_CATEGORY_LABELS.join(', ') : categoryLabels[0];

  const systemPrompt =
    '너는 경기남부 지역 커뮤니티 게시판의 지역 광고 문구를 쓰는 카피라이터다. ' +
    '실제 경기남부 주민이나 동네 소상공인이 직접 올린 것처럼 자연스럽고 현실적인 광고를 작성한다. ' +
    '과장되거나 허위인 표현, 존재하지 않는 브랜드는 쓰지 않는다. 반드시 한국어로만 작성한다.';

  const userPrompt = [
    `${REGION_TAG} 지역의 '${categoryText}' 분야 광고글 ${batchCount}개를 만들어줘.`,
    '',
    '사용할 수 있는 지역(도시(동네들)):',
    CITY_LIST_TEXT,
    `이번 묶음에서는 특히 ${cityHintForBatch(batchIndex)} 지역을 골고루 포함해줘.`,
    '',
    '조건:',
    '- 제목은 40자 이내, 핵심을 담아 눈에 띄게.',
    '- 본문은 2~4문장, 150~320자 정도로 구체적으로.',
    '- location은 "OO시 OO동" 형식으로, 위 지역 목록의 도시와 동네만 사용.',
    '- 가격, 시간, 연락 방법, 조건 등 현실적인 디테일을 넣어 진짜 같은 광고로.',
    '- 각 광고는 서로 완전히 다른 업종/내용이어야 하고, 도시를 다양하게 섞어줘.',
    isMixed ? '- 6개 분야(업체 홍보/할인·이벤트/구인구직/모임·모집/부동산/중고거래)를 골고루 섞어줘.' : '',
    '',
    '아래 JSON 형식으로만 답해줘:',
    '{ "ads": [ { "title": "제목", "content": "본문", "location": "수원시 영통동" } ] }',
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
  let parsed: { ads?: GeneratedAd[] } = {};
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return [];
  }
  return Array.isArray(parsed.ads) ? parsed.ads : [];
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

    // AI 열쇠가 아직 없으면 프론트에서 안내 문구를 띄울 수 있게 알려준다.
    if (!apiKey) {
      return json({ error: 'AI_NOT_CONFIGURED' });
    }

    // AI 광고 글쓰기는 관리자(소유자)만 가능하다. 그 외 계정은 글이 만들어지지 않는다.
    const authorized = await isAuthorizedCaller(req, supabaseUrl);
    if (!authorized) {
      return json(
        { error: 'FORBIDDEN', message: 'AI 글쓰기는 관리자만 쓸 수 있어요.' },
        403,
      );
    }

    let body: { category?: string; count?: number } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const categoryKey = typeof body.category === 'string' ? body.category : 'all';
    const categoryLabels =
      categoryKey === 'all'
        ? ALL_CATEGORY_LABELS
        : [CATEGORY_LABELS[categoryKey] ?? CATEGORY_LABELS.business];
    const primaryLabel = categoryLabels[0];

    const rawCount = Number(body.count);
    const count = Number.isFinite(rawCount)
      ? Math.min(Math.max(Math.trunc(rawCount), 1), MAX_COUNT)
      : 5;

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('slug', BOARD_SLUG)
      .maybeSingle();
    if (boardError || !board) {
      return json({ error: 'BOARD_NOT_FOUND' }, 404);
    }

    const batches = Math.ceil(count / BATCH_SIZE);
    const collected: GeneratedAd[] = [];
    for (let b = 0; b < batches; b += 1) {
      const remaining = count - collected.length;
      if (remaining <= 0) break;
      const batchCount = Math.min(BATCH_SIZE, remaining);
      try {
        const ads = await generateBatch(apiKey, categoryLabels, batchCount, b);
        collected.push(...ads);
      } catch (err) {
        // 첫 묶음부터 실패하면 에러, 이후 묶음 실패는 지금까지 모은 것만 저장한다.
        if (collected.length === 0) {
          return json({ error: 'AI_REQUEST_FAILED', message: String(err).slice(0, 300) }, 502);
        }
        break;
      }
    }

    const rows = collected
      .slice(0, count)
      .map((ad, index) => {
        const title = clampText(ad.title, 80);
        const content = clampText(ad.content, 900);
        if (!title || !content) return null;
        const locationText = clampText(ad.location, 40) || fallbackLocation(index);
        return {
          board_id: board.id,
          title,
          content,
          author_name: BOT_NAME,
          content_type: 'story',
          location: locationText,
          tags: [REGION_TAG, primaryLabel],
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

    return json({ inserted: inserted?.length ?? rows.length, category: primaryLabel });
  } catch (err) {
    return json({ error: 'UNEXPECTED', message: String(err) }, 500);
  }
});
