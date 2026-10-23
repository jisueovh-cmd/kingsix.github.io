import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Profile } from '@/types/home';
import type { PersonalRecord, RecordInput, RecordVisibility } from '@/lib/records';

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function displayName(profile: Profile | null): string {
  return profile?.nickname || profile?.username || profile?.name || '회원';
}

/** 내 기록방: 내 기록 목록 + 작성/수정/삭제 + 공개 토글 + 게시판 공유/내리기. */
export function useMyRecords() {
  const { user, profile } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await supabase
        .from('personal_records')
        .select('*')
        .eq('owner_id', user.id)
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (res.error) throw res.error;
      setRecords((res.data ?? []) as PersonalRecord[]);
    } catch (err) {
      setError(toMessage(err, '기록을 불러오지 못했어요.'));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const createRecord = useCallback(
    async (input: RecordInput): Promise<string | null> => {
      if (!user) return '로그인이 필요해요.';
      try {
        const res = await supabase.from('personal_records').insert({
          owner_id: user.id,
          title: input.title.trim(),
          content: input.content.trim(),
          mood: input.mood,
          visibility: input.visibility,
          record_date: input.record_date,
          location: input.location?.trim() || null,
          tags: input.tags.length > 0 ? input.tags : [],
          images: input.images.length > 0 ? input.images : [],
        });
        if (res.error) throw res.error;
        await load();
        return null;
      } catch (err) {
        return toMessage(err, '기록을 저장하지 못했어요.');
      }
    },
    [user, load],
  );

  const updateRecord = useCallback(
    async (record: PersonalRecord, input: RecordInput): Promise<string | null> => {
      if (!user) return '로그인이 필요해요.';
      try {
        const res = await supabase
          .from('personal_records')
          .update({
            title: input.title.trim(),
            content: input.content.trim(),
            mood: input.mood,
            visibility: input.visibility,
            record_date: input.record_date,
            location: input.location?.trim() || null,
            tags: input.tags.length > 0 ? input.tags : [],
            images: input.images.length > 0 ? input.images : [],
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.id)
          .eq('owner_id', user.id);
        if (res.error) throw res.error;

        // 게시판에 공유된 기록이면 공유 글도 함께 최신 내용으로 맞춰요.
        if (record.shared_post_id) {
          await supabase
            .from('posts')
            .update({
              title: input.title.trim(),
              content: input.content.trim(),
              tags: input.tags.length > 0 ? input.tags : [],
              images: input.images.length > 0 ? input.images : [],
              location: input.location?.trim() || null,
            })
            .eq('id', record.shared_post_id)
            .eq('author_id', user.id);
        }

        await load();
        return null;
      } catch (err) {
        return toMessage(err, '기록을 수정하지 못했어요.');
      }
    },
    [user, load],
  );

  const removeRecord = useCallback(
    async (record: PersonalRecord): Promise<string | null> => {
      if (!user) return '로그인이 필요해요.';
      setBusyId(record.id);
      try {
        if (record.shared_post_id) {
          await supabase
            .from('posts')
            .delete()
            .eq('id', record.shared_post_id)
            .eq('author_id', user.id);
        }
        const res = await supabase
          .from('personal_records')
          .delete()
          .eq('id', record.id)
          .eq('owner_id', user.id);
        if (res.error) throw res.error;
        await load();
        return null;
      } catch (err) {
        return toMessage(err, '기록을 삭제하지 못했어요.');
      } finally {
        setBusyId(null);
      }
    },
    [user, load],
  );

  const setVisibility = useCallback(
    async (record: PersonalRecord, visibility: RecordVisibility): Promise<string | null> => {
      if (!user) return '로그인이 필요해요.';
      setBusyId(record.id);
      try {
        const res = await supabase
          .from('personal_records')
          .update({ visibility, updated_at: new Date().toISOString() })
          .eq('id', record.id)
          .eq('owner_id', user.id);
        if (res.error) throw res.error;
        setRecords((prev) =>
          prev.map((r) => (r.id === record.id ? { ...r, visibility } : r)),
        );
        return null;
      } catch (err) {
        return toMessage(err, '공개 설정을 바꾸지 못했어요.');
      } finally {
        setBusyId(null);
      }
    },
    [user],
  );

  const shareToBoard = useCallback(
    async (record: PersonalRecord, boardId: string): Promise<string | null> => {
      if (!user) return '로그인이 필요해요.';
      if (!boardId) return '공유할 게시판을 골라주세요.';
      setBusyId(record.id);
      try {
        const payload = {
          board_id: boardId,
          title: record.title,
          content: record.content ?? '',
          author_name: displayName(profile),
          content_type: 'story',
          location: record.location,
          tags: record.tags && record.tags.length > 0 ? record.tags : [],
          images: record.images && record.images.length > 0 ? record.images : [],
          author_id: user.id,
          source_record_id: record.id,
        };

        if (record.shared_post_id) {
          const res = await supabase
            .from('posts')
            .update(payload)
            .eq('id', record.shared_post_id)
            .eq('author_id', user.id);
          if (res.error) throw res.error;
          const up = await supabase
            .from('personal_records')
            .update({ board_id: boardId, updated_at: new Date().toISOString() })
            .eq('id', record.id)
            .eq('owner_id', user.id);
          if (up.error) throw up.error;
        } else {
          const res = await supabase.from('posts').insert(payload).select('id').maybeSingle();
          if (res.error) throw res.error;
          const postId = (res.data as { id?: string } | null)?.id;
          if (!postId) throw new Error('공유 글을 만들지 못했어요.');
          const up = await supabase
            .from('personal_records')
            .update({ shared_post_id: postId, board_id: boardId, updated_at: new Date().toISOString() })
            .eq('id', record.id)
            .eq('owner_id', user.id);
          if (up.error) throw up.error;
        }

        await load();
        return null;
      } catch (err) {
        return toMessage(err, '게시판에 공유하지 못했어요.');
      } finally {
        setBusyId(null);
      }
    },
    [user, profile, load],
  );

  const unshareFromBoard = useCallback(
    async (record: PersonalRecord): Promise<string | null> => {
      if (!user) return '로그인이 필요해요.';
      setBusyId(record.id);
      try {
        if (record.shared_post_id) {
          const del = await supabase
            .from('posts')
            .delete()
            .eq('id', record.shared_post_id)
            .eq('author_id', user.id);
          if (del.error) throw del.error;
        }
        const res = await supabase
          .from('personal_records')
          .update({ shared_post_id: null, board_id: null, updated_at: new Date().toISOString() })
          .eq('id', record.id)
          .eq('owner_id', user.id);
        if (res.error) throw res.error;
        await load();
        return null;
      } catch (err) {
        return toMessage(err, '게시판에서 내리지 못했어요.');
      } finally {
        setBusyId(null);
      }
    },
    [user, load],
  );

  return {
    user,
    records,
    loading,
    error,
    busyId,
    reload: load,
    createRecord,
    updateRecord,
    removeRecord,
    setVisibility,
    shareToBoard,
    unshareFromBoard,
  };
}

/** 공개 기록방 방문: 닉네임(username)으로 주인을 찾고 공개 기록만 불러와요. */
export function useRoomRecords(username?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const profRes = await supabase
        .from('profiles')
        .select('id, username, nickname, name, phone, avatar_url, created_at')
        .eq('username', username)
        .maybeSingle();
      if (profRes.error) throw profRes.error;
      const owner = (profRes.data as Profile | null) ?? null;
      if (!owner) {
        setNotFound(true);
        setProfile(null);
        setRecords([]);
        return;
      }
      setProfile(owner);

      const recRes = await supabase
        .from('personal_records')
        .select('*')
        .eq('owner_id', owner.id)
        .eq('visibility', 'public')
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (recRes.error) throw recRes.error;
      setRecords((recRes.data ?? []) as PersonalRecord[]);
    } catch (err) {
      setError(toMessage(err, '기록방을 불러오지 못했어요.'));
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, records, loading, error, notFound, reload: load };
}