import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Board, ContentType, PostWithBoard } from '@/types/home';

interface CategoryContentState {
  boards: Board[];
  posts: PostWithBoard[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryContentState = {
  boards: [],
  posts: [],
  loading: true,
  error: null,
};

interface RawPost {
  id: string;
  board_id: string;
  title: string;
  author_name: string;
  is_secret: boolean;
  view_count: number;
  content_type: ContentType;
  created_at: string;
  board?:
    | { slug: string; name: string }
    | { slug: string; name: string }[]
    | null;
}

function normalizePost(raw: RawPost): PostWithBoard {
  const board = Array.isArray(raw.board) ? raw.board[0] ?? null : raw.board ?? null;
  return { ...raw, board };
}

/**
 * 카테고리 페이지용: 주어진 게시판 slug 목록에 속한 실제 게시판 + 게시글을 불러온다.
 * (예시 데이터가 아니라 홈/게시판과 같은 실데이터를 사용해 조회수·좋아요 수치가 화면마다 달라 보이지 않게 한다.)
 */
export function useCategoryContent(boardSlugs: string[]) {
  const [state, setState] = useState<CategoryContentState>(initialState);
  const slugKey = boardSlugs.join(',');

  const load = useCallback(async () => {
    const slugs = slugKey ? slugKey.split(',') : [];
    if (slugs.length === 0) {
      setState({ boards: [], posts: [], loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const boardsRes = await supabase
        .from('boards')
        .select('id, slug, name, description, cover_image, sort_order')
        .in('slug', slugs)
        .order('sort_order', { ascending: true });
      if (boardsRes.error) throw boardsRes.error;

      const boards = (boardsRes.data ?? []) as Board[];
      const boardIds = boards.map((b) => b.id);

      let posts: PostWithBoard[] = [];
      if (boardIds.length) {
        const postsRes = await supabase
          .from('posts')
          .select(
            'id, board_id, title, author_name, is_secret, view_count, content_type, created_at, board:boards(slug, name)',
          )
          .in('board_id', boardIds)
          .order('created_at', { ascending: false })
          .limit(12);
        if (postsRes.error) throw postsRes.error;
        posts = ((postsRes.data ?? []) as RawPost[]).map(normalizePost);
      }

      setState({ boards, posts, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
      // 읽기가 실패해도 예시 데이터로 덮지 않는다. 이미 불러온 내용이 있으면 그대로 유지한다.
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, [slugKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}