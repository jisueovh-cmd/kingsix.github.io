import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { getGuestKey, hasViewedLocally, markViewedLocally } from '@/lib/viewStore';
import type { ContentType, PostLink, PostWithBoard } from '@/types/home';

interface PostDetailState {
  post: PostWithBoard | null;
  loading: boolean;
  error: string | null;
}

const initialState: PostDetailState = {
  post: null,
  loading: true,
  error: null,
};

interface RawPost {
  id: string;
  board_id: string;
  title: string;
  content: string | null;
  author_name: string;
  author_id: string | null;
  is_secret: boolean;
  view_count: number;
  like_count?: number;
  content_type: ContentType;
  rating: number | null;
  location: string | null;
  created_at: string;
  images?: string[] | null;
  videos?: string[] | null;
  tags?: string[] | null;
  links?: PostLink[] | null;
  board?: { slug: string; name: string; cover_image?: string | null } | { slug: string; name: string; cover_image?: string | null }[] | null;
}

function normalizePost(raw: RawPost): PostWithBoard {
  const board = Array.isArray(raw.board) ? raw.board[0] ?? null : raw.board ?? null;
  return { ...raw, board };
}

export function usePostDetail(
  postId: string | undefined,
  options?: { trackView?: boolean },
) {
  const trackView = options?.trackView ?? true;
  const { user } = useAuth();
  const [state, setState] = useState<PostDetailState>(initialState);
  const countedRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!postId) {
      setState({ post: null, loading: false, error: '글을 찾을 수 없습니다.' });
      return;
    }
    setState({ post: null, loading: true, error: null });

    try {
      const res = await supabase
        .from('posts')
        .select(
          'id, board_id, title, content, author_name, author_id, is_secret, view_count, like_count, content_type, rating, location, created_at, images, videos, tags, links, board:boards(slug, name, cover_image)',
        )
        .eq('id', postId)
        .maybeSingle();

      if (res.error) throw res.error;
      if (!res.data) throw new Error('글을 찾을 수 없습니다.');

      const post = normalizePost(res.data as RawPost);
      setState({ post, loading: false, error: null });

      if (trackView && countedRef.current !== postId) {
        countedRef.current = postId;
        // 같은 사람은 1번만 카운트한다. 회원은 DB 계정 기준, 비회원은 브라우저 기준.
        if (!user && hasViewedLocally(postId)) {
          // 이 브라우저에서 이미 본 글 → 새로고침해도 조회수를 올리지 않는다.
        } else {
          const guestKey = user ? null : getGuestKey();
          supabase
            .rpc('register_post_view', { p_post_id: postId, p_guest_key: guestKey })
            .then(
              (res) => {
                if (!res.error && !user) markViewedLocally(postId);
                const count = typeof res.data === 'number' ? res.data : null;
                if (count !== null) {
                  // 조회수는 내려가지 않는다: 현재 표시값보다 커졌을 때만 갱신.
                  setState((prev) =>
                    prev.post
                      ? {
                          ...prev,
                          post: {
                            ...prev.post,
                            view_count: Math.max(prev.post.view_count ?? 0, count),
                          },
                        }
                      : prev,
                  );
                }
              },
              () => {},
            );
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '글을 불러오지 못했습니다.';
      setState({ post: null, loading: false, error: message });
    }
  }, [postId, trackView, user]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}