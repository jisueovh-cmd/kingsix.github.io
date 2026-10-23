import { supabase } from '@/lib/supabase';
import { getGuestKey } from '@/lib/viewStore';

// 한국시간(Asia/Seoul) 기준 오늘 날짜를 YYYY-MM-DD로 반환한다.
// (0시에 날짜가 바뀌므로 "매일 0시~24시" 집계 기준이 된다.)
export function getTodayKst(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

// 오늘 방문을 1회 기록한다. 브라우저별 고유 키 + 날짜 조합이 유일하므로
// 같은 사람이 하루에 여러 번 와도 중복 저장되지 않는다.
// 저장은 DB 함수(record_site_visit, ON CONFLICT DO NOTHING)가 원자적으로 처리한다.
export async function recordDailyVisit(): Promise<void> {
  const visitorKey = getGuestKey();
  if (!visitorKey) return;
  const { error } = await supabase.rpc('record_site_visit', { p_visitor_key: visitorKey });
  if (error) throw error;
}

// 오늘(KST) 순 방문자 수를 서버 함수로부터 받아온다.
export async function fetchTodayVisitCount(): Promise<number> {
  const today = getTodayKst();
  const { data, error } = await supabase.rpc('get_visit_count', { p_date: today });
  if (error) throw error;
  const parsed = typeof data === 'string' ? Number(data) : data;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}

// 전체 기간 누적 순 방문자 수를 서버 함수로부터 받아온다.
export async function fetchTotalVisitCount(): Promise<number> {
  const { data, error } = await supabase.rpc('get_total_visit_count');
  if (error) throw error;
  const parsed = typeof data === 'string' ? Number(data) : data;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}

export interface DailyVisitStat {
  date: string;
  visitors: number;
}

// 최근 N일간 날짜별 순 방문자 수를 서버 함수로부터 받아온다(관리자 통계용).
export async function fetchVisitDailyStats(days = 14): Promise<DailyVisitStat[]> {
  const { data, error } = await supabase.rpc('get_visit_daily_stats', { p_days: days });
  if (error) throw error;
  const rows: unknown[] = Array.isArray(data) ? data : [];
  return rows
    .map((row) => {
      const record = row as { visit_date?: unknown; visitors?: unknown };
      return {
        date: typeof record.visit_date === 'string' ? record.visit_date : '',
        visitors: Number(record.visitors) || 0,
      };
    })
    .filter((item) => item.date.length > 0);
}