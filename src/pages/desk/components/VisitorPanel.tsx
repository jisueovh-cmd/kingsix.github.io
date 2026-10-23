import { useEffect, useMemo, useState } from 'react';
import { useOnlineVisitors } from '@/hooks/usePresence';
import { useDailyVisits } from '@/hooks/useDailyVisits';

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(joinedAt: string, now: number): string {
  const start = new Date(joinedAt).getTime();
  if (Number.isNaN(start)) return '-';
  const total = Math.max(0, Math.floor((now - start) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

export default function VisitorPanel() {
  const visitors = useOnlineVisitors();
  const { count: todayCount, total: totalCount } = useDailyVisits();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sorted = useMemo(
    () =>
      [...visitors].sort((a, b) => {
        if (a.loggedIn !== b.loggedIn) return a.loggedIn ? -1 : 1;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      }),
    [visitors],
  );

  // 비로그인 방문자는 누구인지 특정할 수 없으므로 '익명 #1, #2…'로 순번을 붙여 구분한다.
  const labeled = useMemo(() => {
    let anonIndex = 0;
    return sorted.map((item) => {
      if (!item.loggedIn) anonIndex += 1;
      return { ...item, anonLabel: item.loggedIn ? '' : `익명 #${anonIndex}` };
    });
  }, [sorted]);

  const loggedInCount = visitors.filter((item) => item.loggedIn).length;
  const anonymousCount = visitors.length - loggedInCount;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-accent-200 bg-accent-100/60 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wide text-accent-700">
            <i className="ri-radar-line" />
            지금 접속
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">
            {visitors.length}
            <span className="ml-1 text-sm font-medium text-foreground-600">명</span>
          </p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-100/60 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wide text-foreground-600">
            <i className="ri-user-line" />
            로그인 접속
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">
            {loggedInCount}
            <span className="ml-1 text-sm font-medium text-foreground-600">명</span>
          </p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-100/60 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wide text-foreground-600">
            <i className="ri-user-3-line" />
            비로그인(익명)
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">
            {anonymousCount}
            <span className="ml-1 text-sm font-medium text-foreground-600">명</span>
          </p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-100/60 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wide text-foreground-600">
            <i className="ri-eye-line" />
            오늘 방문
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">
            {todayCount ?? '-'}
            <span className="ml-1 text-sm font-medium text-foreground-600">명</span>
          </p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-100/60 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wide text-foreground-600">
            <i className="ri-user-voice-line" />
            누적 방문
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">
            {totalCount ?? '-'}
            <span className="ml-1 text-sm font-medium text-foreground-600">명</span>
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-background-200 bg-background-50">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-background-200 px-5 py-4">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground-900">
            <i className="ri-live-line text-accent-600" />
            실시간 접속자 목록
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-foreground-500">
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
            </span>
            실시간 자동 갱신
          </span>
        </div>

        {labeled.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-foreground-500">
            지금 접속 중인 사람이 없어요.
          </p>
        ) : (
          <ul className="divide-y divide-background-200">
            {labeled.map((item) => (
              <li
                key={item.key}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      item.loggedIn
                        ? 'bg-accent-100 text-accent-700'
                        : 'bg-background-200 text-foreground-600'
                    }`}
                  >
                    <i className={`${item.loggedIn ? 'ri-user-line' : 'ri-user-3-line'} text-base`} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground-900">
                      {item.loggedIn && item.nickname ? item.nickname : item.anonLabel}
                    </p>
                    <p className="text-xs text-foreground-500">
                      {item.loggedIn ? '로그인 회원' : '비로그인 방문자'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-foreground-600">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <i className="ri-login-circle-line text-accent-600" />
                    {formatTime(item.joinedAt)} 접속
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap tabular-nums">
                    <i className="ri-timer-line text-secondary-600" />
                    {formatDuration(item.joinedAt, now)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-1 text-xs leading-relaxed text-foreground-500">
        <p>· 접속 시각과 머문 시간은 이 화면을 보는 동안 실시간으로 갱신돼요.</p>
        <p>· 로그인하지 않은 방문자는 개인을 특정할 수 없어 &lsquo;익명&rsquo;으로만 표시돼요.</p>
        <p>· 이 도구를 쓰는 관리자 본인도 목록에 함께 포함돼요.</p>
      </div>
    </section>
  );
}