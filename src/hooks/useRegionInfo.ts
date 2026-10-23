import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RegionCategoryKey, RegionHubConfig, RegionPost } from '@/lib/region';

export const REGION_PAGE_SIZE = 9;

/** AI 지역 정보 생성 시 쓸 수 있는 분야 키. 'all'은 모든 분야를 골고루 섞는다. */
export type RegionGenerateCategory = RegionCategoryKey | 'all';
/** AI 지역 정보 생성 시 쓸 수 있는 지역 그룹 키. 'all'은 해당 허브 전체를 섞는다. */
export type RegionGenerateArea = string;

interface RegionBoard {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image: string | null;
}

interface RegionInfoState {
  board: RegionBoard | null;
  posts: RegionPost[];
  total: number;
  todayCount: number;
  loading: boolean;
  error: string | null;
}

export interface RegionGenerateResult {
  error: string | null;
  inserted: number;
  notConfigured: boolean;
}

const initialState: RegionInfoState = {
  board: null,
  posts: [],
  total: 0,
  todayCount: 0,
  loading: true,
  error: null,
};

function startOfTodayIso(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

export function useRegionInfo(
  page: number,
  categoryLabel: string | null,
  areaLabel: string | null,
  hub: RegionHubConfig,
) {
  const [state, setState] = useState<RegionInfoState>(initialState);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: prev.board === null, error: null }));
    try {
      const boardRes = await supabase
        .from('boards')
        .select('id, slug, name, description, cover_image')
        .eq('slug', hub.slug)
        .maybeSingle();
      if (boardRes.error) throw boardRes.error;
      if (!boardRes.data) throw new Error('지역 정보 게시판을 찾을 수 없습니다.');
      const board = boardRes.data as RegionBoard;

      const from = (page - 1) * REGION_PAGE_SIZE;
      const to = from + REGION_PAGE_SIZE - 1;

      let postsQuery = supabase
        .from('posts')
        .select('id, title, content, author_name, location, tags, view_count, created_at', {
          count: 'exact',
        })
        .eq('board_id', board.id);
      if (categoryLabel) postsQuery = postsQuery.contains('tags', [categoryLabel]);
      if (areaLabel) postsQuery = postsQuery.contains('tags', [areaLabel]);

      const [postsRes, todayRes] = await Promise.all([
        postsQuery.order('created_at', { ascending: false }).range(from, to),
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('board_id', board.id)
          .gte('created_at', startOfTodayIso()),
      ]);

      if (postsRes.error) throw postsRes.error;

      setState({
        board,
        posts: (postsRes.data ?? []) as RegionPost[],
        total: postsRes.count ?? (postsRes.data ?? []).length,
        todayCount: todayRes.count ?? 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '지역 정보를 불러오지 못했습니다.';
      // 읽기가 실패해도 예시 데이터로 덮지 않는다. 이미 불러온 내용이 있으면 그대로 유지한다.
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, [page, categoryLabel, areaLabel, hub.slug]);

  useEffect(() => {
    load();
  }, [load]);

  const generate = useCallback(
    async (
      category: RegionGenerateCategory,
      area: RegionGenerateArea,
      count: number,
    ): Promise<RegionGenerateResult> => {
      try {
        const { data, error } = await supabase.functions.invoke('region-info-ai', {
          body: { category, area, count, scope: hub.key },
        });
        if (error) {
          return {
            error: 'AI 서버 호출에 실패했어요. 잠시 후 다시 시도해 주세요.',
            inserted: 0,
            notConfigured: false,
          };
        }
        const payload = data as { inserted?: number; error?: string; message?: string };
        if (payload?.error === 'AI_NOT_CONFIGURED') {
          return { error: null, inserted: 0, notConfigured: true };
        }
        if (payload?.error) {
          return { error: payload.message ?? '지역 정보를 만들지 못했어요.', inserted: 0, notConfigured: false };
        }
        await load();
        return { error: null, inserted: payload?.inserted ?? 0, notConfigured: false };
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요.',
          inserted: 0,
          notConfigured: false,
        };
      }
    },
    [load, hub.key],
  );

  return { ...state, reload: load, generate };
}