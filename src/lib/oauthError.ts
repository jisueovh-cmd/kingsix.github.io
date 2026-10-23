export interface OAuthDiagnosis {
  cause: string;
  steps: string[];
  code?: string;
}

const providerDisplayName = (provider: string): string => {
  const p = (provider || '').toLowerCase();
  if (p.includes('kakao')) return '카카오';
  if (p.includes('naver')) return '네이버';
  return '간편';
};

/**
 * 로그인 실패 메시지를 읽고, 원인과 해결 방법을 자동으로 짚어준다.
 * Supabase·카카오·네이버에서 오는 여러 형태의 에러 문구를 폭넓게 매칭한다.
 */
export function diagnoseOAuthError(provider: string, raw: string): OAuthDiagnosis {
  const name = providerDisplayName(provider);
  const code = decodeURIComponent(raw || '').trim();
  const lower = code.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => lower.includes(k));

  // 1) 프로바이더가 아예 켜져 있지 않음 (Unsupported provider / not found 포함)
  if (
    has(
      'not enabled',
      'provider is not enabled',
      'unsupported provider',
      'provider not found',
      'provider_not_found',
      'not supported',
      'not found',
    )
  ) {
    return {
      cause: `${name} 로그인이 Supabase에 아직 켜져 있지 않아요.`,
      steps: [
        'Supabase 대시보드 → Authentication → Sign In / Providers 로 들어가주세요.',
        `${name} 항목을 찾아 활성화하고, ${name} 개발자 콘솔의 Client ID(앱 키)와 Secret을 붙여넣어 저장해주세요.`,
        `${name} 개발자 콘솔의 Callback URL은 Supabase 프로젝트의 /auth/v1/callback 주소로 맞춰주세요.`,
      ],
      code,
    };
  }

  // 2) 돌아올 주소(Redirect URL)가 허용 목록에 없음
  if (
    has(
      'redirect_uri_mismatch',
      'redirect uri',
      'redirect uri mismatch',
      'redirect url',
      'invalid redirect',
      'not allowed',
      'not in allow',
      'allow list',
      'allowlist',
      'redirect_to',
    )
  ) {
    return {
      cause: '로그인 후 돌아올 주소가 허용 목록에 없어요.',
      steps: [
        'Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs 에 우리 사이트 주소와 사이트주소/auth 를 추가해주세요.',
        '카카오·네이버 개발자 콘솔의 Redirect URI도 같은 주소로 맞춰주세요.',
        '사이트 도메인을 바꿨다면 새 주소로 다시 등록해야 해요.',
      ],
      code,
    };
  }

  // 3) 앱 키(Client ID) 또는 시크릿이 잘못됨
  if (
    has(
      'invalid_client',
      'client_id',
      'client id',
      'invalid app',
      'app key',
      'koe005',
      'koe101',
      'koe102',
      'invalid client secret',
    )
  ) {
    return {
      cause: `${name} 로그인 키(Client ID/Secret)가 올바르지 않아요.`,
      steps: [
        '카카오·네이버 개발자 콘솔에서 키를 다시 복사해주세요.',
        'Supabase → Authentication → Providers 에 다시 입력하고 저장해주세요.',
        '공백이나 줄바꿈이 섞여 들어가지 않았는지 확인해주세요.',
      ],
      code,
    };
  }

  // 4) 사용자가 취소했거나 앱 승인이 거부됨
  if (has('access_denied', 'access denied', 'user denied', 'denied', 'cancel', '취소')) {
    return {
      cause: '로그인을 취소했거나 앱 승인이 거부됐어요.',
      steps: [
        '다시 로그인을 시도해주세요.',
        '카카오 앱이 검수 대기/비활성 상태인지 개발자 콘솔에서 확인해주세요.',
        '동의 화면에서 필수 항목 동의를 거부하면 로그인이 막힐 수 있어요.',
      ],
      code,
    };
  }

  // 5) 이메일 인증이 아직 안 됨
  if (has('email not confirmed', 'email_not_confirmed')) {
    return {
      cause: '이메일 인증이 아직 완료되지 않았어요.',
      steps: [
        '가입할 때 받은 인증 메일의 링크를 눌러주세요.',
        '메일이 안 보이면 스팸함도 확인해주세요.',
      ],
      code,
    };
  }

  // 5-1) 카카오 동의항목(스코프) 불일치 — 앱에 설정하지 않은 항목을 요청함 (KOE205)
  if (has('koe205', '설정하지 않은', '동의항목', '동의 항목')) {
    return {
      cause: `${name} 로그인은 이메일(account_email) 제공 동의가 함께 필요해요. 카카오 앱에서 이메일 동의가 꺼져 있어 로그인이 막혔어요.`,
      steps: [
        '카카오 개발자 콘솔 → 카카오 로그인 → 동의항목에서 "카카오계정(이메일)"을 켜주세요.',
        '이메일 동의는 앱을 "비즈 앱"으로 전환한 뒤에만 켤 수 있어요. (앱 설정 → 일반 → 사업자 정보 입력)',
        '전환·설정 후 다시 로그인을 시도해주세요.',
      ],
      code,
    };
  }

  // 6) 이메일 제공 동의가 빠짐
  if (has('email not provided', 'email scope', 'email address', 'no email')) {
    return {
      cause: '로그인에 필요한 이메일 제공 동의가 빠졌어요.',
      steps: [
        '카카오 개발자 콘솔 → 카카오 로그인 → 동의항목에서 이메일을 켜주세요.',
        '네이버는 애플리케이션의 이메일 제공 설정을 확인해주세요.',
      ],
      code,
    };
  }

  // 7) 보안 상태값(state) 만료
  if (has('bad_oauth_state', 'state parameter', 'invalid state', 'oauth state')) {
    return {
      cause: '로그인 보안 상태값이 만료됐어요.',
      steps: [
        '페이지를 새로고침한 뒤 다시 시도해주세요.',
        '여러 탭에서 동시에 로그인하지 말고 한 탭에서만 시도해주세요.',
      ],
      code,
    };
  }

  // 8) 인증 코드 교환 실패
  if (has('unable to exchange', 'invalid_grant', 'exchange', 'code verifier', 'code_verifier')) {
    return {
      cause: '인증 코드 확인에 실패했어요. (코드 만료·재사용)',
      steps: [
        '잠시 후 다시 로그인을 시도해주세요.',
        '이전 단계에서 뒤로가기로 돌아온 경우 새로 시도하면 해결돼요.',
      ],
      code,
    };
  }

  // 9) 서버/네트워크 일시 오류
  if (
    has(
      'server_error',
      'temporarily',
      'temporary',
      'unavailable',
      'network',
      'fetch failed',
      'timeout',
      'internal',
    )
  ) {
    return {
      cause: '로그인 서버가 잠시 불안정해요.',
      steps: [
        '1~2분 뒤 다시 시도해주세요.',
        '그래도 안 되면 Supabase 프로젝트 상태를 확인해주세요.',
      ],
      code,
    };
  }

  // 10) 그 외
  return {
    cause: `${name} 로그인을 시작하지 못했어요.`,
    steps: [
      '잠시 후 다시 시도해주세요.',
      '계속 실패하면 위 코드를 알려주시면 정확한 원인을 찾아드려요.',
    ],
    code,
  };
}