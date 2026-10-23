import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  applyHeadMeta,
  applyJsonLd,
  getSeoOverride,
  subscribeSeoOverride,
  type SeoData,
} from '@/lib/seo';
import { resolveRouteSeo } from '@/lib/route-seo';

// Single centralized route-aware head manager. Reacts to every route change
// and restores all managed tags so metadata from a previous route never leaks
// into the next one.
export default function RouteSeo() {
  const location = useLocation();
  const [override, setOverride] = useState<SeoData | null>(getSeoOverride());

  useEffect(() => {
    return subscribeSeoOverride(() => setOverride(getSeoOverride()));
  }, []);

  useEffect(() => {
    const seo = override ?? resolveRouteSeo(location.pathname);
    applyHeadMeta(seo);
    applyJsonLd(seo.schema ?? null);
  }, [location.pathname, override]);

  return null;
}