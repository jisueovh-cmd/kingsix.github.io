import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { isOwner } from '@/lib/owner';

// 로그인한 계정이 관리자인지 판별한다.
// - 고정 관리자(OWNER_EMAILS)면 즉시 true.
// - 그 외에는 DB(site_admins)에 등록된 관리자인지 서버 함수로 확인한다.
// - 아직 확인 중이면 null을 반환한다(로딩 상태).
export function useIsAdmin(): boolean | null {
  const { user } = useAuth();
  const email = user?.email ?? '';
  const [isAdmin, setIsAdmin] = useState<boolean | null>(email ? null : false);

  useEffect(() => {
    let active = true;

    if (!email) {
      setIsAdmin(false);
      return () => {
        active = false;
      };
    }

    if (isOwner(email)) {
      setIsAdmin(true);
      return () => {
        active = false;
      };
    }

    setIsAdmin(null);
    (async () => {
      try {
        const { data, error } = await supabase.rpc('is_site_admin', { p_email: email });
        if (active) setIsAdmin(error ? false : Boolean(data));
      } catch {
        if (active) setIsAdmin(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [email]);

  return isAdmin;
}