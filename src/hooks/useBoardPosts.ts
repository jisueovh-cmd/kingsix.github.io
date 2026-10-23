import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Board, PostWithBoard } from '@/types/home';

export const BOARD_PAGE_SIZE = 10;

export type BoardSort = 'latest' | 'popular' | 'trending';

const POST_SELECT =
  'id, board_id, title, content, author_name, is_secret, view_count, like_count, content_type, rating, location, created_at, images, tags, videos, links';

interface BoardPostsState {
  board: Board | null;
  boards: Board[];
  posts: PostWithBoard[];
  total: number;
  allTags: string[];
  loading: boolean;
  error: string | null;
}

const initialState: BoardPostsState = {
  board: null,
  boards: [],
  posts: [],
  total: 0,
  allTags: [],
  loading: true,
  error: null,
};

export function useBoardPosts(
  slug: string | undefined,
  page: number,
  sort: BoardSort = 'latest',
  tag: string | null = null,
) {
  const [state, setState] = useState<BoardPostsState>(initialState);

  const load = useCallback(async () => {
    if (!slug) {
      setState({ ...initialState, loading: false, error: '게시판을 찾을 수 없습니다.' });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [boardRes, boardsRes] = await Promise.all([
        supabase
          .from('boards')
          .select('id, slug, name, description, cover_image, sort_order, owner_id, is_user_created')
          .eq('slug', slug)
          .maybeSingle(),
        supabase
          .from('boards')
          .select('id, slug, name, description, cover_image, sort_order, owner_id, is_user_created')
          .order('sort_order', { ascending: true }),
      ]);

      if (boardRes.error) throw boardRes.error;
      if (!boardRes.data) throw new Error('게시판을 찾을 수 없습니다.');

      const board = boardRes.data as Board;
      const boards = (boardsRes.data ?? []) as Board[];
      const from = (page - 1) * BOARD_PAGE_SIZE;
      const to = from + BOARD_PAGE_SIZE - 1;

      let postsQuery = supabase
        .from('posts')
        .select(POST_SELECT, { count: 'exact' })
        .eq('board_id', board.id);

      if (tag) {
        postsQuery = postsQuery.contains('tags', [tag]);
      }

      if (sort === 'popular') {
        postsQuery = postsQuery
          .order('view_count', { ascending: false })
          .order('created_at', { ascending: false });
      } else if (sort === 'trending') {
        const recentFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        postsQuery = postsQuery
          .gte('created_at', recentFrom)
          .order('view_count', { ascending: false });
      } else {
        postsQuery = postsQuery.order('created_at', { ascending: false });
      }

      const postsRes = await postsQuery.range(from, to);
      if (postsRes.error) throw postsRes.error;

      const posts: PostWithBoard[] = ((postsRes.data ?? []) as Omit<PostWithBoard, 'board'>[]).map(
        (p) => ({ ...p, board: { slug: board.slug, name: board.name } }),
      );

      // 댓글 수 + 태그 목록은 현재 게시판 전체 기준으로 별도 집계
      const ids = posts.map((p) => p.id);
      const commentCounts: Record<string, number> = {};

      if (ids.length) {
        const { data: commentRows } = await supabase
          .from('comments')
          .select('post_id')
          .in('post_id', ids);
        (commentRows ?? []).forEach((c) => {
          const pid = (c as { post_id: string }).post_id;
          commentCounts[pid] = (commentCounts[pid] ?? 0) + 1;
        });
      }

      const { data: tagRows } = await supabase
        .from('posts')
        .select('tags')
        .eq('board_id', board.id)
        .limit(300);

      const tagSet = new Set<string>();
      (tagRows ?? []).forEach((row) => {
        ((row as { tags: string[] | null }).tags ?? []).forEach((t) => tagSet.add(t));
      });
      const allTags = Array.from(tagSet).slice(0, 20);

      const postsWithCounts = posts.map((p) => ({
        ...p,
        comment_count: commentCounts[p.id] ?? 0,
      }));

      setState({
        board,
        boards,
        posts: postsWithCounts,
        total: postsRes.count ?? posts.length,
        allTags,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, [slug, page, sort, tag]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}