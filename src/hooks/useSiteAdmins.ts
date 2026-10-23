import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface SiteAdmin {
  email: string;
  added_by: string | null;
  created_at: string;
}

// DB(site_admins)에 등록된 추가 관리자 목록을 불러오고 추가·삭제한다.
// 추가·삭제 권한은 DB RLS(관리자만 허용)가 최종적으로 강제한다.
export function useSiteAdmins(enabled: boolean) {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<SiteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('site_admins')
        .select('email, added_by, created_at')
        .order('created_at', { ascending: true });
      if (err) throw err;
      setAdmins((data ?? []) as SiteAdmin[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '관리자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const addAdmin = useCallback(
    async (email: string): Promise<string | null> => {
      const normalized = email.trim().toLowerCase();
      const { error: err } = await supabase
        .from('site_admins')
        .insert({ email: normalized, added_by: user?.email ?? null });
      if (err) return err.message;
      await load();
      return null;
    },
    [load, user?.email],
  );

  const removeAdmin = useCallback(
    async (email: string): Promise<string | null> => {
      const { error: err } = await supabase.from('site_admins').delete().eq('email', email);
      if (err) return err.message;
      await load();
      return null;
    },
    [load],
  );

  return { admins, loading, error, reload: load, addAdmin, removeAdmin };
}