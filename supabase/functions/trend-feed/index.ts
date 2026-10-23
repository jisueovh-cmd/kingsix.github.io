const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_ITEMS = 12;

// 요약은 원문을 대체하지 않도록 짧게만 노출한다.
const SUMMARY_MAX = 140;

// 검색 결과는 DB에 저장하지 않는다. 서버 메모리에서만 아주 짧게 재사용한다.
// (네이버/구글 검색 API 약관의 '결과 저장·가공 금지' 취지를 지키기 위함)
const MEMORY_TTL_MS = 10 * 60 * 1000;

const NAVER_ENDPOINT = 'https://naverapihub.apigw.ntruss.com/search/v1/news';

const TREND_QUERIES = [
  { query: '요즘 유행', category: 'trend' },
  { query: 'MZ 트렌드', category: 'trend' },
  { query: '요즘 뜨는 핫플레이스', category: 'hotplace' },
  { query: '데이트 핫플', category: 'hotplace' },
  { query: '20대 취미 추천', category: 'hobby' },
  { query: '30대 취미', category: 'hobby' },
];

function buildHeaderCombos(clientId, clientSecret) {
  return [
    { id: clientId, secret: clientSecret, label: 'normal' },
    { id: clientSecret, secret: clientId, label: 'swapped' },
  ];
}

function authHeaders(combo) {
  return {
    'X-NCP-APIGW-API-KEY-ID': combo.id,
    'X-NCP-APIGW-API-KEY': combo.secret,
  };
}

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

// 원문 인용 범위를 최소화하기 위해 요약을 짧게 자른다.
function clip(text, max = SUMMARY_MAX) {
  const value = clean(text);
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
}

// 구글 뉴스 RSS 설명은 제목을 그대로 반복하는 경우가 많아 중복을 걷어낸다.
function stripRepeatedTitle(desc, title) {
  const body = clean(desc);
  const head = clean(title);
  if (head && body.startsWith(head)) return body.slice(head.length).trim();
  return body;
}

async function detectNaverAuth(clientId, clientSecret) {
  const combos = buildHeaderCombos(clientId, clientSecret);
  for (const combo of combos) {
    const endpoint = `${NAVER_ENDPOINT}?query=${encodeURIComponent('요즘 유행')}&display=1&start=1&sort=sim&format=json`;
    try {
      const res = await fetch(endpoint, { headers: authHeaders(combo) });
      if (res.ok) return combo;
    } catch {
      // 다음 조합 시도
    }
  }
  return null;
}

async function fetchByQuery(query, category, combo) {
  const endpoint = `${NAVER_ENDPOINT}?query=${encodeURIComponent(
    query,
  )}&display=4&start=1&sort=sim&format=json`;
  try {
    const res = await fetch(endpoint, { headers: authHeaders(combo) });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data?.items) ? data.items : [];
    return list
      .map((it) => {
        const link = it.originallink || it.link || '';
        const title = clean(it.title);
        return {
          id: '',
          title,
          summary: clip(it.description),
          url: link,
          source: hostOf(link),
          publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString(),
          category,
        };
      })
      .filter((it) => it.url && it.title);
  } catch {
    return [];
  }
}

function extractTag(xml, tag) {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(cdata) || xml.match(plain);
  return match ? match[1].trim() : '';
}

async function fetchFromRss(query, category) {
  const endpoint = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query,
  )}&hl=ko&gl=KR&ceid=KR:ko`;
  try {
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReaddyTrendBot/1.0)' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    return blocks
      .slice(0, 4)
      .map((block) => {
        const rawTitle = clean(decodeXmlEntities(extractTag(block, 'title')));
        const link = extractTag(block, 'link') || '';
        const source = clean(decodeXmlEntities(extractTag(block, 'source')));
        const pub = extractTag(block, 'pubDate');
        const desc = decodeXmlEntities(extractTag(block, 'description'));

        let title = rawTitle;
        if (source && title.endsWith(` - ${source}`)) {
          title = title.slice(0, -(source.length + 3)).trim();
        }

        return {
          id: '',
          title,
          summary: clip(stripRepeatedTitle(desc, title)),
          url: link,
          source: source || hostOf(link),
          publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
          category,
        };
      })
      .filter((it) => it.url && it.title);
  } catch {
    return [];
  }
}

function mergeRoundRobin(buckets) {
  const seen = new Set();
  const merged = [];
  let round = 0;
  let added = true;
  while (added && merged.length < MAX_ITEMS) {
    added = false;
    for (const bucket of buckets) {
      const item = bucket[round];
      if (item && !seen.has(item.url)) {
        seen.add(item.url);
        merged.push(item);
        added = true;
        if (merged.length >= MAX_ITEMS) break;
      }
    }
    round += 1;
  }
  return merged;
}

function withIds(items) {
  return items.map((item, index) => ({ ...item, id: `${item.category}-${index}` }));
}

async function collectLive() {
  const clientId = Deno.env.get('NAVER_CLIENT_ID');
  const clientSecret = Deno.env.get('NAVER_CLIENT_SECRET');

  let items = [];
  let source = 'naver';
  let naverAuth = null;

  if (clientId && clientSecret) {
    const combo = await detectNaverAuth(clientId, clientSecret);
    if (combo) {
      naverAuth = combo.label;
      const naverResults = await Promise.all(
        TREND_QUERIES.map((q) => fetchByQuery(q.query, q.category, combo)),
      );
      items = mergeRoundRobin(naverResults);
    }
  }

  if (items.length === 0) {
    const rssResults = await Promise.all(
      TREND_QUERIES.map((q) => fetchFromRss(q.query, q.category)),
    );
    items = mergeRoundRobin(rssResults);
    source = 'rss';
  }

  return { items, source, naverAuth };
}

// 서버 인스턴스 메모리 안에서만 쓰는 아주 짧은 캐시 (DB 저장 아님)
let memoryCache = null;
let inflight = null;

function getLive() {
  if (!inflight) {
    inflight = collectLive().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let force = false;
    try {
      const parsed = await req.json();
      force = Boolean(parsed && parsed.force);
    } catch {
      force = false;
    }

    if (
      !force &&
      memoryCache &&
      memoryCache.items.length > 0 &&
      Date.now() - memoryCache.fetchedAt < MEMORY_TTL_MS
    ) {
      return json({
        items: memoryCache.items,
        fetchedAt: new Date(memoryCache.fetchedAt).toISOString(),
        cached: true,
        source: 'memory',
      });
    }

    let live;
    try {
      live = await getLive();
    } catch {
      live = { items: [], source: 'error', naverAuth: null };
    }

    const items = withIds(live.items);
    if (items.length > 0) {
      memoryCache = { items, fetchedAt: Date.now() };
    }

    return json({
      items,
      fetchedAt: new Date().toISOString(),
      cached: false,
      naverAuth: live.naverAuth,
      source: items.length > 0 ? live.source : 'empty',
    });
  } catch (err) {
    return json({ items: [], source: 'error', error: String(err) });
  }
});
