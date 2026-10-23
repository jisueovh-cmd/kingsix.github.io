// Hook for pages with dynamic content (post, category, board) to push
// their real title / description / structured data into the centralized
// route-aware head manager.

import { useEffect } from 'react';
import { setSeoOverride, type SeoData } from '@/lib/seo';

export function useSeo(seo: SeoData | null, deps: readonly unknown[]) {
  useEffect(() => {
    setSeoOverride(seo);
    return () => {
      setSeoOverride(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}