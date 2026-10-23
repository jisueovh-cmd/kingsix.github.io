import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ContentType, PostWithBoard } from '@/types/home';

interface ExploreState {
  posts: PostWithBoard[];
  loading: boolean;
  error: string | null;
}

const initialState: ExploreState = {
  posts: [],
  loading: true,
  error: null,
};

interface RawPost {
  id: string;
  board_id: string;
  title: string;
  content: string | null;
  author_name: string;
  is_secret: boolean;
  view_count: number;
  content_type: ContentType;
  rating: number | null;
  location: string | null;
  created_at: string;
  board?: { slug: string; name: string; cover_image?: string | null } | { slug: string; name: string; cover_image?: string | null }[] | null;
}

function normalizePost(raw: RawPost): PostWithBoard {
  const board = Array.isArray(raw.board) ? raw.board[0] ?? null : raw.board ?? null;
  return { ...raw, board };
}

export function useExploreContent() {
  const [state, setState] = useState<ExploreState>(initialState);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await supabase
        .from('posts')
        .select(
          'id, board_id, title, content, author_name, is_secret, view_count, content_type, rating, location, created_at, board:boards(slug, name, cover_image)',
        )
        .order('created_at', { ascending: false })
        .limit(100);

      if (res.error) throw res.error;

      const posts = ((res.data ?? []) as RawPost[]).map(normalizePost);
      setState({ posts, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
      // 읽기가 실패해도 예시 데이터로 덮지 않는다. 이미 불러온 내용이 있으면 그대로 유지한다.
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}