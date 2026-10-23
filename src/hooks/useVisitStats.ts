import { useCallback, useEffect, useState } from 'react';
import { fetchVisitDailyStats, type DailyVisitStat } from '@/lib/visits';

// 관리자 데스크의 '방문 통계' 탭에서 최근 N일 날짜별 순 방문자 수를 불러온다.
export function useVisitStats(days = 14) {
  const [stats, setStats] = useState<DailyVisitStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVisitDailyStats(days);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '방문 통계를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, reload: load };
}