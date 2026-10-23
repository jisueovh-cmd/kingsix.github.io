import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/** 방문자 식별 키: 로그인했으면 회원 id, 아니면 브라우저별 익명 id. */
function getVisitorKey(userId: string | null | undefined): string {
  if (userId) return `u:${userId}`;
  if (typeof window === 'undefined') return 'a:unknown';
  try {
    const stored = window.localStorage.getItem('room_visitor_id');
    if (stored) return `a:${stored}`;
    const rand =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem('room_visitor_id', rand);
    return `a:${rand}`;
  } catch {
    return `a:${Date.now()}`;
  }
}

interface VisitStats {
  uniqueVisitors: number;
  totalVisits: number;
  loading: boolean;
}

/**
 * 기록방 방문자 수 집계.
 * 공개 기록방을 방문하면(주인 본인 제외) 세션당 한 번 방문 기록을 남기고,
 * 순 방문자 수 / 전체 방문 수를 읽어온다.
 */
export function useRoomVisits(
  ownerId: string | undefined,
  isOwner: boolean,
  userId?: string | null,
): VisitStats {
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!ownerId) {
      setLoading(false);
      return;
    }
    try {
      const res = await supabase.rpc('room_visit_stats', { p_owner: ownerId });
      if (res.error) throw res.error;
      const row = (Array.isArray(res.data) ? res.data[0] : res.data) as
        | { unique_visitors?: number; total_visits?: number }
        | null;
      setUniqueVisitors(Number(row?.unique_visitors ?? 0));
      setTotalVisits(Number(row?.total_visits ?? 0));
    } catch {
      // 방문자 수는 부가 정보라 실패해도 화면은 그대로 보여준다.
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!ownerId) {
        setLoading(false);
        return;
      }
      if (!isOwner) {
        try {
          const sessionKey = `room_visit_${ownerId}`;
          const already = typeof window !== 'undefined' && window.sessionStorage.getItem(sessionKey);
          if (!already) {
            if (typeof window !== 'undefined') window.sessionStorage.setItem(sessionKey, '1');
            await supabase.from('room_visits').insert({
              room_owner_id: ownerId,
              visitor_key: getVisitorKey(userId),
            });
          }
        } catch {
          // 방문 기록 실패는 무시한다.
        }
      }
      if (active) await loadStats();
    };
    run();
    return () => {
      active = false;
    };
  }, [ownerId, isOwner, userId, loadStats]);

  return { uniqueVisitors, totalVisits, loading };
}