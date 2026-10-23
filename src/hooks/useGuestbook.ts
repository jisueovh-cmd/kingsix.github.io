import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { GuestbookEntry, GuestbookInput } from '@/lib/records';
import { GUESTBOOK_MAX_LENGTH, GUESTBOOK_NAME_MAX_LENGTH } from '@/lib/records';

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/** 기록방 방명록: 목록 조회 + 남기기(익명 허용) + 지우기. */
export function useGuestbook(ownerId: string | undefined) {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ownerId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await supabase
        .from('guestbook_entries')
        .select('id, room_owner_id, author_id, author_name, content, created_at')
        .eq('room_owner_id', ownerId)
        .order('created_at', { ascending: false });
      if (res.error) throw res.error;
      setEntries((res.data ?? []) as GuestbookEntry[]);
    } catch (err) {
      setError(toMessage(err, '방명록을 불러오지 못했어요.'));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = useCallback(
    async (input: GuestbookInput): Promise<string | null> => {
      if (!ownerId) return '기록방을 찾지 못했어요.';
      const content = input.content.trim();
      if (!content) return '남길 내용을 적어주세요.';
      if (content.length > GUESTBOOK_MAX_LENGTH) {
        return `방명록은 ${GUESTBOOK_MAX_LENGTH}자까지 쓸 수 있어요.`;
      }
      setSubmitting(true);
      try {
        const fallbackName = profile?.nickname || profile?.username || profile?.name || '';
        const name = (input.name.trim() || fallbackName).slice(0, GUESTBOOK_NAME_MAX_LENGTH);
        const res = await supabase.from('guestbook_entries').insert({
          room_owner_id: ownerId,
          author_id: user?.id ?? null,
          author_name: name || null,
          content,
        });
        if (res.error) throw res.error;
        await load();
        return null;
      } catch (err) {
        return toMessage(err, '방명록을 남기지 못했어요.');
      } finally {
        setSubmitting(false);
      }
    },
    [ownerId, user, profile, load],
  );

  const removeEntry = useCallback(async (id: string): Promise<string | null> => {
    setBusyId(id);
    try {
      const res = await supabase.from('guestbook_entries').delete().eq('id', id);
      if (res.error) throw res.error;
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      return null;
    } catch (err) {
      return toMessage(err, '방명록을 지우지 못했어요.');
    } finally {
      setBusyId(null);
    }
  }, []);

  return {
    entries,
    loading,
    error,
    submitting,
    busyId,
    reload: load,
    addEntry,
    removeEntry,
  };
}