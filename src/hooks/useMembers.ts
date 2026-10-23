import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Member {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  post_count: number;
}

interface RawProfile {
  id: string;
  nickname: string | null;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

/**
 * 실제 가입 회원(profiles)을 불러와 커뮤니티 '사람들' 섹션에 노출한다.
 * 글 개수는 posts.author_id 로 실제 집계하며, 실패해도 회원 목록은 그대로 보여준다.
 */
export function useMembers(limit = 12) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(!hasLoadedRef.current);
    setError(null);
    try {
      const [profilesRes, postsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, nickname, name, username, avatar_url')
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase.from('posts').select('author_id').not('author_id', 'is', null),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      const counts: Record<string, number> = {};
      if (!postsRes.error && postsRes.data) {
        for (const row of postsRes.data as { author_id: string }[]) {
          counts[row.author_id] = (counts[row.author_id] ?? 0) + 1;
        }
      }

      const list: Member[] = ((profilesRes.data ?? []) as RawProfile[]).map((p) => ({
        id: p.id,
        name: p.nickname || p.name || p.username || '회원',
        username: p.username,
        avatar_url: p.avatar_url,
        post_count: counts[p.id] ?? 0,
      }));

      hasLoadedRef.current = true;
      setMembers(list);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : '회원 정보를 불러오지 못했습니다.';
      setError(message);
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { members, loading, error, reload: load };
}