import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RegionPost } from '@/lib/region';

interface RegionPreviewState {
  posts: RegionPost[];
  loading: boolean;
}

/**
 * 홈 등에서 지역 정보 게시판의 최신 글을 몇 개만 미리 보여줄 때 사용한다.
 * 실제 게시판 글을 그대로 가져와서 카드가 없는 글로 연결되는 일이 없도록 한다.
 * (조회 실패 시에는 빈 목록을 돌려주고, 예시 데이터로 대체하지 않는다)
 */
export function useRegionPreview(boardSlug: string, limit = 3) {
  const [state, setState] = useState<RegionPreviewState>({ posts: [], loading: true });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const boardRes = await supabase
        .from('boards')
        .select('id')
        .eq('slug', boardSlug)
        .maybeSingle();
      if (boardRes.error) throw boardRes.error;
      if (!boardRes.data) throw new Error('게시판을 찾을 수 없습니다.');

      const postsRes = await supabase
        .from('posts')
        .select('id, title, content, author_name, location, tags, view_count, created_at')
        .eq('board_id', boardRes.data.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (postsRes.error) throw postsRes.error;

      setState({ posts: (postsRes.data ?? []) as RegionPost[], loading: false });
    } catch {
      setState({ posts: [], loading: false });
    }
  }, [boardSlug, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}