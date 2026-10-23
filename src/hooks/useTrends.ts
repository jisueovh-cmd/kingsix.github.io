import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { mockTrends } from '@/mocks/trends';
import type { TrendItem } from '@/types/home';

interface TrendState {
  items: TrendItem[];
  loading: boolean;
  error: string | null;
  usedFallback: boolean;
  fetchedAt: string | null;
}

const initialState: TrendState = {
  items: [],
  loading: true,
  error: null,
  usedFallback: false,
  fetchedAt: null,
};

// 화면을 오래 켜둔 경우를 대비한 주기적 갱신 간격(서버 메모리 캐시와 동일한 10분)
const AUTO_REFRESH_MS = 10 * 60 * 1000;

export function useTrends() {
  const [state, setState] = useState<TrendState>(initialState);
  const hasLiveData = useRef(false);

  const load = useCallback(async (silent = false) => {
    // silent 갱신일 때는 스켈레톤을 띄우지 않아 화면 깜빡임이 없다.
    if (!silent) setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.functions.invoke('trend-feed', {
        body: { force: !silent },
      });
      if (error) throw error;

      const payload = data as { items?: TrendItem[]; fetchedAt?: string | null; error?: string };
      const items = Array.isArray(payload?.items) ? payload.items : [];
      if (items.length === 0) throw new Error('표시할 트렌드가 아직 없어요.');

      hasLiveData.current = true;
      setState({
        items,
        loading: false,
        error: null,
        usedFallback: false,
        fetchedAt: payload?.fetchedAt ?? new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '트렌드를 불러오지 못했어요.';
      setState((prev) => {
        // 이미 실시간 데이터를 받아둔 상태라면, 갱신 실패 시 기존 내용을 유지한다.
        if (hasLiveData.current && prev.items.length > 0) {
          return { ...prev, loading: false, error: message };
        }
        return {
          items: mockTrends,
          loading: false,
          error: message,
          usedFallback: true,
          fetchedAt: null,
        };
      });
    }
  }, []);

  // 최초 로드
  useEffect(() => {
    load(false);
  }, [load]);

  // 일정 시간마다 조용히 갱신한다. (서버가 짧게 캐시하므로 과도한 호출은 없다)
  useEffect(() => {
    const timer = window.setInterval(() => load(true), AUTO_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  // 탭으로 돌아오거나 창에 포커스가 오면 조용히 최신 상태를 확인한다.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [load]);

  return {
    ...state,
    reload: () => load(false),
    silentReload: () => load(true),
  };
}