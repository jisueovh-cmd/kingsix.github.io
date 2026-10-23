import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function randomPassword(len = 24): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += chars.charAt(bytes[i] % chars.length);
  return out;
}

// 외부(소셜) 로그인 계정은 실제 이메일을 그대로 쓰면 "같은 이메일이면 자동 병합"되는
// Supabase 정책 때문에 홈페이지 계정과 섞여 버린다. 그래서 서비스 전용(합성) 이메일을
// 써서 카카오·네이버·홈페이지 계정이 절대 서로 합쳐지지 않게 한다.
function oauthEmail(provider: string, id: string): string {
  return `${provider}_${id}@oauth.kingsix.kr`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { access_token } = await req.json();
    if (!access_token) {
      return json(400, { error: "카카오 액세스 토큰이 없어요." });
    }

    // 1) 카카오 사용자 정보 조회 (토큰 검증 겸용)
    const kakaoRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const kakaoData = await kakaoRes.json();
    const id = kakaoData?.id;
    if (!id) {
      return json(401, { error: "카카오 사용자 정보를 가져오지 못했어요. 다시 로그인해주세요." });
    }

    const kakaoId = String(id);
    const nickname =
      kakaoData?.kakao_account?.profile?.nickname || kakaoData?.properties?.nickname || "";
    const email = oauthEmail("kakao", kakaoId);

    // 2) 서비스 역할 클라이언트
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // 3) 전용(합성) 이메일 기준 기존 사용자 확인 → 없으면 새로 만든다.
    let existingUserId: string | null = null;
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const found = existing?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) existingUserId = found.id;

    const password = randomPassword();

    if (existingUserId) {
      await admin.auth.admin.updateUserById(existingUserId, {
        password,
        email_confirm: true,
        user_metadata: { provider: "kakao", kakao_id: kakaoId, nickname },
      });
    } else {
      const { error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        password,
        user_metadata: { provider: "kakao", kakao_id: kakaoId, nickname },
      });
      if (createErr) return json(500, { error: createErr.message });
    }

    // 4) 세션 발급 (서버에서 로그인 → 세션 토큰 반환)
    const { data: signInData, error: signInErr } = await admin.auth.signInWithPassword({
      email,
      password,
    });
    if (signInErr || !signInData.session) {
      return json(500, { error: "로그인 세션을 만들지 못했어요. 잠시 후 다시 시도해주세요." });
    }

    return json(200, {
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
    });
  } catch (err) {
    return json(500, {
      error: err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.",
    });
  }
});
