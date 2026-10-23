import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { excerptText } from '@/lib/format';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  /** 알림을 눌렀을 때 이동할 주소 (#comments 로 댓글 위치까지 이동) */
  to: string;
  read: boolean;
}

interface NotificationsState {
  items: AppNotification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  loading: true,
  error: null,
};

const READ_KEY = 'jp-notif-read-ids';

function readReadIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function persistReadIds(ids: string[]): void {
  try {
    // 오래된 항목이 무한정 쌓이지 않도록 최근 200개만 남긴다.
    window.localStorage.setItem(READ_KEY, JSON.stringify(ids.slice(-200)));
  } catch {
    // 저장소 접근이 막혀 있어도 읽음 처리는 화면 상태로만 유지한다.
  }
}

interface RawMyPost {
  id: string;
  board?: { slug?: string | null } | { slug?: string | null }[] | null;
}

interface RawComment {
  id: string;
  post_id: string;
  nickname: string | null;
  content: string;
  created_at: string;
}

/**
 * 로그인한 회원이 쓴 글에 실제로 달린 댓글만 모아 알림으로 보여준다.
 * 가짜 활동/자리표시 데이터는 만들지 않는다. (댓글이 없으면 알림도 없음)
 */
export function useNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationsState>(initialState);

  const load = useCallback(async () => {
    if (!user) {
      setState({ items: [], loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const postsRes = await supabase
        .from('posts')
        .select('id, board:boards(slug)')
        .eq('author_id', user.id);
      if (postsRes.error) throw postsRes.error;

      const myPosts = (postsRes.data ?? []) as RawMyPost[];
      const postBoardSlug = new Map<string, string>();
      for (const post of myPosts) {
        const board = Array.isArray(post.board) ? post.board[0] : post.board;
        if (board?.slug) postBoardSlug.set(post.id, board.slug);
      }

      const postIds = Array.from(postBoardSlug.keys());
      if (postIds.length === 0) {
        setState({ items: [], loading: false, error: null });
        return;
      }

      const commentsRes = await supabase
        .from('comments')
        .select('id, post_id, nickname, content, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: false })
        .limit(30);
      if (commentsRes.error) throw commentsRes.error;

      const readIds = new Set(readReadIds());
      const items: AppNotification[] = ((commentsRes.data ?? []) as RawComment[]).map((row) => ({
        id: row.id,
        title: `${row.nickname?.trim() || '익명'}님이 회원님의 글에 댓글을 남겼어요`,
        body: excerptText(row.content, 80),
        createdAt: row.created_at,
        to: `/board/${postBoardSlug.get(row.post_id)}/${row.post_id}#comments`,
        read: readIds.has(row.id),
      }));

      setState({ items, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : '알림을 불러오지 못했습니다.';
      setState({ items: [], loading: false, error: message });
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = useCallback((id: string) => {
    setState((prev) => {
      if (prev.items.every((n) => n.id !== id || n.read)) return prev;
      const ids = new Set(readReadIds());
      ids.add(id);
      persistReadIds(Array.from(ids));
      return { ...prev, items: prev.items.map((n) => (n.id === id ? { ...n, read: true } : n)) };
    });
  }, []);

  const markAllRead = useCallback(() => {
    setState((prev) => {
      const ids = new Set(readReadIds());
      prev.items.forEach((n) => ids.add(n.id));
      persistReadIds(Array.from(ids));
      return { ...prev, items: prev.items.map((n) => ({ ...n, read: true })) };
    });
  }, []);

  return { ...state, reload: load, markRead, markAllRead };
}