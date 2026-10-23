import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Comment } from '@/types/home';

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  loading: true,
  error: null,
};

export function useComments(postId: string | undefined) {
  const [state, setState] = useState<CommentsState>(initialState);
  const { user } = useAuth();

  const load = useCallback(async () => {
    if (!postId) {
      setState({ comments: [], loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, post_id, nickname, content, author_id, parent_id, created_at, updated_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState({
        comments: (data ?? []) as Comment[],
        loading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글을 불러오지 못했습니다.';
      setState({ comments: [], loading: false, error: message });
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const addComment = useCallback(
    async (nickname: string, content: string, parentId?: string | null) => {
      if (!postId) return false;
      const trimmed = content.trim();
      if (!trimmed) return false;
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        nickname: nickname.trim() || '익명',
        content: trimmed.slice(0, 500),
        author_id: user?.id ?? null,
        parent_id: parentId ?? null,
      });
      if (error) throw error;
      await load();
      return true;
    },
    [postId, load, user],
  );

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!user) return false;
      const trimmed = content.trim();
      if (!trimmed) return false;
      const { error } = await supabase
        .from('comments')
        .update({ content: trimmed.slice(0, 500), updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('author_id', user.id);
      if (error) throw error;
      await load();
      return true;
    },
    [load, user],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!user) return false;
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);
      if (error) throw error;
      await load();
      return true;
    },
    [load, user],
  );

  return { ...state, reload: load, addComment, updateComment, deleteComment };
}