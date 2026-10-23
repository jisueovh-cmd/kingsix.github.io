import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  readLikedIds,
  readBookmarkedIds,
  localToggleLike,
  localToggleBookmark,
} from '@/lib/reactionStore';

export interface ToggleLikeResult {
  liked: boolean;
  likeCount: number | null;
}

interface ReactionsContextValue {
  likedIds: string[];
  bookmarkedIds: string[];
  isLiked: (postId: string) => boolean;
  isBookmarked: (postId: string) => boolean;
  toggleLike: (postId: string) => Promise<ToggleLikeResult>;
  toggleBookmark: (postId: string) => Promise<boolean>;
  ready: boolean;
}

const ReactionsContext = createContext<ReactionsContextValue | undefined>(undefined);

export function ReactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // 로그인 회원이면 DB(post_reactions)에서, 비로그인이면 브라우저에서 반응 상태를 불러온다.
  useEffect(() => {
    let active = true;
    setReady(false);

    async function load() {
      try {
        if (user) {
          const { data, error } = await supabase
            .from('post_reactions')
            .select('post_id, reaction_type')
            .eq('user_id', user.id);
          if (!active) return;
          if (!error) {
            const likes: string[] = [];
            const marks: string[] = [];
            (data ?? []).forEach((r) => {
              const row = r as { post_id: string; reaction_type: string };
              if (row.reaction_type === 'like') likes.push(row.post_id);
              else if (row.reaction_type === 'bookmark') marks.push(row.post_id);
            });
            setLikedIds(likes);
            setBookmarkedIds(marks);
          }
        } else {
          setLikedIds(readLikedIds());
          setBookmarkedIds(readBookmarkedIds());
        }
      } finally {
        if (active) setReady(true);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  const isLiked = useCallback((postId: string) => likedIds.includes(postId), [likedIds]);
  const isBookmarked = useCallback(
    (postId: string) => bookmarkedIds.includes(postId),
    [bookmarkedIds],
  );

  const toggleLike = useCallback(
    async (postId: string): Promise<ToggleLikeResult> => {
      if (user) {
        const { data, error } = await supabase.rpc('toggle_post_like', { p_post_id: postId });
        if (!error) {
          const row = (Array.isArray(data) ? data[0] : data) as
            | { liked?: boolean; like_count?: number }
            | null;
          const liked = Boolean(row?.liked);
          const likeCount = typeof row?.like_count === 'number' ? row.like_count : null;
          setLikedIds((prev) =>
            liked ? (prev.includes(postId) ? prev : [...prev, postId]) : prev.filter((i) => i !== postId),
          );
          return { liked, likeCount };
        }
        return { liked: likedIds.includes(postId), likeCount: null };
      }

      // 비로그인(게스트): 브라우저에 상태를 남기고, 전체 좋아요 수는 기존처럼 RPC로 반영한다.
      const liked = localToggleLike(postId);
      setLikedIds(readLikedIds());
      const delta = liked ? 1 : -1;
      const { data } = await supabase.rpc('adjust_post_like', {
        p_post_id: postId,
        p_delta: delta,
      });
      return { liked, likeCount: typeof data === 'number' ? data : null };
    },
    [user, likedIds],
  );

  const toggleBookmark = useCallback(
    async (postId: string): Promise<boolean> => {
      if (user) {
        const { data, error } = await supabase.rpc('toggle_post_bookmark', { p_post_id: postId });
        if (!error) {
          const marked = Boolean(data);
          setBookmarkedIds((prev) =>
            marked ? (prev.includes(postId) ? prev : [...prev, postId]) : prev.filter((i) => i !== postId),
          );
          return marked;
        }
        return bookmarkedIds.includes(postId);
      }

      const marked = localToggleBookmark(postId);
      setBookmarkedIds(readBookmarkedIds());
      return marked;
    },
    [user, bookmarkedIds],
  );

  const value = useMemo<ReactionsContextValue>(
    () => ({
      likedIds,
      bookmarkedIds,
      isLiked,
      isBookmarked,
      toggleLike,
      toggleBookmark,
      ready,
    }),
    [likedIds, bookmarkedIds, isLiked, isBookmarked, toggleLike, toggleBookmark, ready],
  );

  return <ReactionsContext.Provider value={value}>{children}</ReactionsContext.Provider>;
}

export function useReactions(): ReactionsContextValue {
  const ctx = useContext(ReactionsContext);
  if (!ctx) {
    throw new Error('useReactions must be used within a ReactionsProvider');
  }
  return ctx;
}