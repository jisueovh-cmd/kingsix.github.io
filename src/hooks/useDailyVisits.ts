import { useEffect, useState } from 'react';
import {
  fetchTodayVisitCount,
  fetchTotalVisitCount,
  getTodayKst,
  recordDailyVisit,
} from '@/lib/visits';

interface DailyVisitsState {
  count: number | null;
  total: number | null;
  today: string;
  loading: boolean;
}

// 방문 기록 후 오늘(KST) 순 방문자 수와 누적 방문자 수를 조회한다.
export function useDailyVisits(): DailyVisitsState {
  const [count, setCount] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        await recordDailyVisit();
      } catch {
        // 기록 실패는 무시하고 조회는 계속 진행
      }

      const [todayResult, totalResult] = await Promise.allSettled([
        fetchTodayVisitCount(),
        fetchTotalVisitCount(),
      ]);

      if (!active) return;

      setCount(todayResult.status === 'fulfilled' ? todayResult.value : null);
      setTotal(totalResult.status === 'fulfilled' ? totalResult.value : null);
      setLoading(false);
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  return { count, total, today: getTodayKst(), loading };
}