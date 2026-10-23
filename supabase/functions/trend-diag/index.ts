const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const NAVER_ENDPOINT = 'https://naverapihub.apigw.ntruss.com/search/v1/news';

async function probe(id: string, secret: string) {
  const endpoint =
    NAVER_ENDPOINT +
    '?query=' +
    encodeURIComponent('요즘 유행') +
    '&display=1&start=1&sort=sim&format=json';
  try {
    const res = await fetch(endpoint, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': id,
        'X-NCP-APIGW-API-KEY': secret,
      },
    });
    const text = await res.text();
    let sample = '';
    try {
      sample = JSON.parse(text)?.items?.[0]?.title ?? '';
    } catch {
      // ignore
    }
    return { ok: res.ok, status: res.status, sample, body: text.slice(0, 300) };
  } catch (err) {
    return { ok: false, status: 0, sample: '', body: String(err) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const clientId = Deno.env.get('NAVER_CLIENT_ID');
  const clientSecret = Deno.env.get('NAVER_CLIENT_SECRET');

  const lines: string[] = [];

  if (!clientId || !clientSecret) {
    lines.push('결과: SECRETS_MISSING  (Supabase에 키가 없어요)');
    lines.push(`- NAVER_CLIENT_ID 있음: ${Boolean(clientId)}`);
    lines.push(`- NAVER_CLIENT_SECRET 있음: ${Boolean(clientSecret)}`);
    return new Response(lines.join('\n'), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const half = Math.floor(clientId.length / 2);
  const firstHalf = clientId.slice(0, half);
  const lastHalf = clientId.slice(clientId.length - half);

  lines.push(`- NAVER_CLIENT_ID 길이: ${clientId.length}`);
  lines.push(`- NAVER_CLIENT_SECRET 길이: ${clientSecret.length}`);
  lines.push('');

  const cases: { label: string; id: string; secret: string }[] = [
    { label: '입력 그대로', id: clientId, secret: clientSecret },
    { label: 'ID↔Secret 바꿈', id: clientSecret, secret: clientId },
    { label: 'ID 앞 절반만', id: firstHalf, secret: clientSecret },
    { label: 'ID 뒤 절반만', id: lastHalf, secret: clientSecret },
  ];

  let anyOk = false;
  let firstBody = '';

  for (const c of cases) {
    const r = await probe(c.id, c.secret);
    if (r.ok) anyOk = true;
    if (!firstBody) firstBody = r.body;
    lines.push(`[${c.label}] 상태코드 ${r.status} → ${r.ok ? '성공!' : '실패'}`);
    if (r.sample) lines.push(`   첫 기사: ${r.sample}`);
  }

  lines.push('');
  lines.push(`결과: ${anyOk ? 'OK  (성공! 이제 사이트 새로고침하면 떠요)' : 'NAVER_AUTH_REJECTED  (키가 거절됐어요)'}`);
  if (!anyOk) {
    lines.push('');
    lines.push('네이버가 보낸 메시지:');
    lines.push(firstBody);
  }

  return new Response(lines.join('\n'), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
  });
});
