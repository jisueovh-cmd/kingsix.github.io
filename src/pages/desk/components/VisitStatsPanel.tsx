import { useMemo } from 'react';
import { useVisitStats } from '@/hooks/useVisitStats';

// 최근 N일(KST)의 날짜 목록을 만든다(데이터가 없는 날도 0으로 채워 그래프에 표시).
function lastNDaysKst(n: number): string[] {
  const out: string[] = [];
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(new Date(kstNow.getTime() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  }
  return out;
}

function formatDayLabel(iso: string): string {
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

export default function VisitStatsPanel() {
  const { stats, loading, error, reload } = useVisitStats(14);

  const counts = useMemo(() => {
    const map = new Map(stats.map((item) => [item.date, item.visitors]));
    return lastNDaysKst(14).map((date) => ({ date, visitors: map.get(date) ?? 0 }));
  }, [stats]);

  const max = useMemo(() => counts.reduce((m, d) => Math.max(m, d.visitors), 0), [counts]);
  const sum = useMemo(() => counts.reduce((s, d) => s + d.visitors, 0), [counts]);
  const avg = counts.length > 0 ? sum / counts.length : 0;
  const best = useMemo(
    () => counts.reduce((acc, d) => (d.visitors > acc.visitors ? d : acc), { date: '', visitors: 0 }),
    [counts],
  );

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-100/60 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wide text-foreground-600">
            <i className="ri-bar-chart-2-line" />
            최근 14일 합계
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">
            {sum}
            <span className="ml-1 text-sm font-medium text-foreground-600">명</span>
          </p>
          <p className="mt-1 text-[11px] text-foreground-500">하루 한 번씩 센 값의 합(연인원)</p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-100/60 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wide text-foreground-600">
            <i className="ri-line-chart-line" />
            하루 평균
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">
            {avg.toFixed(1)}
            <span className="ml-1 text-sm font-medium text-foreground-600">명</span>
          </p>
          <p className="mt-1 text-[11px] text-foreground-500">최근 14일 기준</p>
        </div>
        <div className="rounded-lg border border-accent-200 bg-accent-100/60 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wide text-accent-700">
            <i className="ri-trophy-line" />
            최다 방문일
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">
            {best.visitors}
            <span className="ml-1 text-sm font-medium text-foreground-600">명</span>
          </p>
          <p className="mt-1 text-[11px] text-foreground-500">
            {best.date ? formatDayLabel(best.date) : '기록 없음'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-background-200 bg-background-50">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-background-200 px-5 py-4">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground-900">
            <i className="ri-bar-chart-box-line text-accent-600" />
            날짜별 순 방문자 추이
          </h2>
          <button
            type="button"
            onClick={reload}
            className="flex items-center gap-1 rounded-md border border-background-300 px-3 py-1.5 text-xs font-medium text-foreground-700 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-refresh-line" />
            새로고침
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-foreground-500">
            불러오는 중...
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <i className="ri-error-warning-line text-2xl" />
            </span>
            <p className="text-sm text-foreground-600">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="px-5 py-6">
            <div className="flex h-52 items-end gap-1.5 md:gap-2">
              {counts.map((day) => {
                const heightPct = max > 0 ? Math.round((day.visitors / max) * 100) : 0;
                return (
                  <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-[10px] font-medium tabular-nums text-foreground-600">
                      {day.visitors > 0 ? day.visitors : ''}
                    </span>
                    <div className="flex h-40 w-full items-end">
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          day.date === best.date && best.visitors > 0
                            ? 'bg-accent-500'
                            : 'bg-secondary-400/80'
                        }`}
                        style={{ height: `${Math.max(heightPct, day.visitors > 0 ? 6 : 0)}%` }}
                        title={`${formatDayLabel(day.date)} · ${day.visitors}명`}
                      />
                    </div>
                    <span className="text-[10px] whitespace-nowrap text-foreground-500">
                      {formatDayLabel(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1 text-xs leading-relaxed text-foreground-500">
        <p>· 한국시간(0시) 기준이며, 같은 날 여러 번 접속해도 브라우저당 1명으로만 집계돼요.</p>
        <p>· 막대가 강조된 날은 최근 14일 중 방문이 가장 많았던 날이에요.</p>
      </div>
    </section>
  );
}