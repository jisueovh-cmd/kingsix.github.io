import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BOARD_SELECT } from '@/lib/boards';
import type { Board } from '@/types/home';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await supabase
        .from('boards')
        .select(BOARD_SELECT)
        .order('sort_order', { ascending: true });
      if (res.error) throw res.error;
      setBoards((res.data ?? []) as Board[]);
    } catch {
      // 읽기가 실패해도 예시 데이터로 덮지 않는다. 기존 목록을 그대로 유지한다.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { boards, loading, reload: load };
}