import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BOARD_SLUG = 'honey';
const BOT_NAME = '반짝수집가';
const DEFAULT_COUNT = 3;
const MAX_COUNT = 5;
const LINKS_PER_POST = 5;
const MAX_FEED_ITEMS = 30;

// 청년에게 유용한 정보 주제. 검색 결과는 DB에 본문을 저장하지 않고,
// 언론사 원문으로 가는 '링크'만 모아 안내한다(저작권 안전).
const QUERIES = [
  { query: '청년 지원금 신청', tag: '지원금' },
  { query: '청년 월세 지원', tag: '주거' },
  { query: '청년 주거 지원 정책', tag: '주거' },
  { query: '청년 복지 정책', tag: '복지' },
  { query: '청년 청약 특별공급', tag: '청약' },
];

const TAG_ORDER = ['지원금', '주거', '복지', '청약'];

const TAG_INTRO = {
  지원금: '청년이 받을 수 있는 지원금 관련 새 소식이에요.',
  주거: '청년 주거·월세 지원 관련 새 소식이에요.',
  복지: '청년 복지·생활 지원 관련 새 소식이에요.',
  청약: '청년 청약·내 집 마련 관련 새 소식이에요.',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function clean(input) {
  return (input || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeXmlEntities(input) {
  return (input || '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function extractTag(xml, tag) {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(cdata) || xml.match(plain);
  return match ? match[1].trim() : '';
}

async function fetchByQuery(item) {
  const endpoint = `https://news.google.com/rss/search?q=${encodeURIComponent(
    item.query,
  )}&hl=ko&gl=KR&ceid=KR:ko`;
  try {
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReaddyYouthBot/1.0)' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    return blocks
      .slice(0, 6)
      .map((block) => {
        const rawTitle = clean(decodeXmlEntities(extractTag(block, 'title')));
        const link = extractTag(block, 'link') || '';
        const source = clean(decodeXmlEntities(extractTag(block, 'source')));

        let title = rawTitle;
        if (source && title.endsWith(` - ${source}`)) {
          title = title.slice(0, -(source.length + 3)).trim();
        }
        if (title.length > 90) title = `${title.slice(0, 90).trimEnd()}…`;

        return {
          title,
          url: link,
          source: source || hostOf(link),
          tag: item.tag,
        };
      })
      .filter((it) => it.url && it.title);
  } catch {
    return [];
  }
}

async function collectFeed() {
  const buckets = await Promise.all(QUERIES.map((q) => fetchByQuery(q)));
  const seen = new Set();
  const merged = [];
  let round = 0;
  let added = true;
  while (added && merged.length < MAX_FEED_ITEMS) {
    added = false;
    for (const bucket of buckets) {
      const item = bucket[round];
      if (item && !seen.has(item.url)) {
        seen.add(item.url);
        merged.push(item);
        added = true;
        if (merged.length >= MAX_FEED_ITEMS) break;
      }
    }
    round += 1;
  }
  return merged;
}

function koreaDateLabel() {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
}

function buildContent(tag) {
  const intro = TAG_INTRO[tag] || `청년 ${tag} 관련 새 소식이에요.`;
  return [
    intro,
    '',
    '아래 목록은 각 언론사·기관의 원문으로 바로 연결돼요. 자세한 내용과 신청 조건은 꼭 원문에서 확인해 주세요.',
    '',
    '※ 이 글은 원문 내용을 그대로 옮기지 않고, 출처 링크만 모아 안내합니다.',
  ].join('\n');
}

// AI 글쓰기(게시판에 글 넣기)를 허용하는 관리자 이메일 목록.
const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') ?? 'gisueovh7@naver.com')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

async function isAuthorizedCaller(req, supabaseUrl) {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'SERVER_ENV_MISSING' }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 예약 실행(크론)은 x-cron-secret 헤더로, 수동 실행은 관리자 로그인으로 허용한다.
    const cronSecret = req.headers.get('x-cron-secret') ?? '';
    let authorized = false;
    if (cronSecret) {
      const { data: secretRow } = await supabase
        .from('private_config')
        .select('value')
        .eq('key', 'youth_cron_secret')
        .maybeSingle();
      const expected = (secretRow && secretRow.value) || '';
      authorized = Boolean(expected) && cronSecret === expected;
    }
    if (!authorized) {
      authorized = await isAuthorizedCaller(req, supabaseUrl);
    }
    if (!authorized) {
      return json({ error: 'FORBIDDEN', message: '이 도구는 예약 실행 또는 관리자만 쓸 수 있어요.' }, 403);
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const rawCount = Number(body.count);
    const count = Number.isFinite(rawCount)
      ? Math.min(Math.max(Math.trunc(rawCount), 1), MAX_COUNT)
      : DEFAULT_COUNT;

    const feed = await collectFeed();
    if (feed.length === 0) {
      return json({ error: 'FEED_EMPTY' }, 502);
    }

    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('slug', BOARD_SLUG)
      .maybeSingle();
    if (boardError || !board) {
      return json({ error: 'BOARD_NOT_FOUND' }, 404);
    }

    // 이미 안내한 원문 링크는 다시 올리지 않는다.
    const { data: recent } = await supabase
      .from('posts')
      .select('links')
      .eq('board_id', board.id)
      .eq('author_name', BOT_NAME)
      .order('created_at', { ascending: false })
      .limit(120);
    const usedUrls = new Set();
    (recent ?? []).forEach((row) => {
      const links = (row && row.links) || [];
      links.forEach((l) => {
        if (l && l.url) usedUrls.add(l.url);
      });
    });

    const fresh = feed.filter((it) => !usedUrls.has(it.url));
    if (fresh.length === 0) {
      return json({ inserted: 0, reason: 'NO_NEW_ITEMS' });
    }

    // 주제(태그)별로 묶고, 상위 주제부터 하나씩 게시글로 만든다.
    const groups = new Map();
    fresh.forEach((it) => {
      if (!groups.has(it.tag)) groups.set(it.tag, []);
      groups.get(it.tag).push(it);
    });

    const orderedTags = TAG_ORDER.filter((t) => groups.has(t));
    const otherTags = Array.from(groups.keys()).filter((t) => !TAG_ORDER.includes(t));
    const chosenTags = [...orderedTags, ...otherTags].slice(0, count);

    const label = koreaDateLabel();
    const rows = chosenTags
      .map((tag) => {
        const items = (groups.get(tag) || []).slice(0, LINKS_PER_POST);
        if (items.length === 0) return null;
        return {
          board_id: board.id,
          title: `청년 ${tag} 새 소식 (${label})`,
          content: buildContent(tag),
          author_name: BOT_NAME,
          content_type: 'story',
          tags: ['청년', tag],
          links: items.map((it) => ({
            url: it.url,
            title: `${it.source || hostOf(it.url)} · ${it.title}`,
          })),
        };
      })
      .filter((row) => row !== null);

    if (rows.length === 0) {
      return json({ inserted: 0, reason: 'NO_NEW_ITEMS' });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('posts')
      .insert(rows)
      .select('id');
    if (insertError) {
      return json({ error: 'INSERT_FAILED', message: insertError.message }, 500);
    }

    return json({ inserted: inserted?.length ?? rows.length, topics: chosenTags });
  } catch (err) {
    return json({ error: 'UNEXPECTED', message: String(err) }, 500);
  }
});
