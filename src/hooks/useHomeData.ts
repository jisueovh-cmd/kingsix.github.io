import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Board, ContentType, PostWithBoard, SmallTalkMessage } from '@/types/home';

interface HomeDataState {
  boards: Board[];
  posts: PostWithBoard[];
  smallTalk: SmallTalkMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeDataState = {
  boards: [],
  posts: [],
  smallTalk: [],
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
  return {
    id: raw.id,
    board_id: raw.board_id,
    title: raw.title,
    content: raw.content,
    author_name: raw.author_name,
    is_secret: raw.is_secret,
    view_count: raw.view_count,
    content_type: raw.content_type,
    rating: raw.rating,
    location: raw.location,
    created_at: raw.created_at,
    board,
  };
}

export function useHomeData() {
  const [state, setState] = useState<HomeDataState>(initialState);
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);

  const load = useCallback(async () => {
    // 최초 로드에만 스켈레톤을 띄운다. 이후 갱신(실시간 채팅 전송 등)에는 화면을 유지한다.
    setState((prev) => ({ ...prev, loading: !hasLoadedRef.current, error: null }));
    try {
      const [boardsRes, postsRes, talkRes] = await Promise.all([
        supabase
          .from('boards')
          .select('id, slug, name, description, cover_image, sort_order')
          .order('sort_order', { ascending: true }),
        supabase
          .from('posts')
          .select(
            'id, board_id, title, content, author_name, is_secret, view_count, content_type, rating, location, created_at, board:boards(slug, name, cover_image)',
          )
          .order('created_at', { ascending: false })
          .limit(7),
        supabase
          .from('small_talk_messages')
          .select('id, nickname, content, created_at')
          .order('created_at', { ascending: true })
          .limit(60),
      ]);

      if (boardsRes.error) throw boardsRes.error;
      if (postsRes.error) throw postsRes.error;
      if (talkRes.error) throw talkRes.error;

      const boards = (boardsRes.data ?? []) as Board[];
      const posts = ((postsRes.data ?? []) as RawPost[]).map(normalizePost);
      const smallTalk = (talkRes.data ?? []) as SmallTalkMessage[];

      hasLoadedRef.current = true;
      setState({
        boards,
        posts,
        smallTalk,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
      // 읽기가 실패해도 예시 데이터로 덮지 않는다. 이미 불러온 내용이 있으면 그대로 유지한다.
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  const sendSmallTalk = useCallback(
    async (nickname: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return false;
      const { error } = await supabase
        .from('small_talk_messages')
        .insert({ nickname: nickname.trim() || '익명', content: trimmed.slice(0, 300) });
      if (error) throw error;
      await load();
      return true;
    },
    [load],
  );

  return { ...state, reload: load, sendSmallTalk, mountedRef };
}