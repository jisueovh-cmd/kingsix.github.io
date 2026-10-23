import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useReactions } from '@/hooks/useReactions';

export interface MyStats {
  postCount: number;
  savedCount: number;
  level: string;
  levelTier: 'new' | 'active' | 'master';
}

function levelFrom(count: number): { level: string; tier: MyStats['levelTier'] } {
  if (count >= 50) return { level: '자파리 마스터', tier: 'master' };
  if (count >= 10) return { level: '취미 장인', tier: 'master' };
  if (count >= 2) return { level: '꾸준한 회원', tier: 'active' };
  return { level: '새싹 회원', tier: 'new' };
}

export function useMyStats(userId: string | undefined) {
  const { bookmarkedIds } = useReactions();
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      let count = 0;
      if (userId) {
        const { count: c } = await supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', userId);
        count = c ?? 0;
      }
      if (active) setPostCount(count);
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  const { level, tier } = levelFrom(postCount);

  return {
    postCount,
    savedCount: bookmarkedIds.length,
    level,
    levelTier: tier,
  } as MyStats;
}