// Central SEO utilities: constants, head-meta DOM helpers, and a lightweight
// override store used by the route-aware head manager.

import { env } from '@/lib/env';

export const SITE_URL = env.siteUrl;
export const SITE_NAME = '취미 in 자파리';
export const BRAND_NAME = '취미 자파리';

export const SITE_DESCRIPTION =
  '취미 자파리는 여행·맛집·식물·만들기·수집 등 다양한 취미를 기록하고 나누는 따뜻한 취미 커뮤니티입니다. 최신 취미 이야기와 실시간 잡담을 한곳에서 만나보세요.';

export const SITE_KEYWORDS =
  '취미 커뮤니티, 취미 자파리, 여행기, 맛집탐방, 식물키우기, 만들기, 수집';

export const DEFAULT_OG_IMAGE =
  'https://readdy.ai/api/search-image?query=Warm%20editorial%20illustration%20of%20a%20cozy%20creative%20studio%20filled%20with%20plants%2C%20a%20camera%2C%20an%20open%20journal%2C%20art%20supplies%20and%20soft%20sunlight%2C%20cream%20and%20terracotta%20and%20sage%20green%20palette%2C%20modern%20lifestyle%20magazine%20cover%2C%20airy%20flat%20illustration%20with%20subtle%20grain&width=1600&height=900&seq=hero-japari-v2&orientation=landscape';

export interface SeoData {
  title: string;
  description?: string;
  keywords?: string;
  /** Canonical path starting with "/". Use null to remove the canonical tag. */
  path: string | null;
  type?: 'website' | 'article';
  image?: string;
  robots?: string;
  schema?: object | object[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string) {
  const el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (el) el.remove();
}

function setTitleMeta(title: string) {
  document.title = title;
}

function setCanonical(href: string | null) {
  const el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
    link.setAttribute('href', href);
  } else {
    el.setAttribute('href', href);
  }
}

function setRobots(content: string | null) {
  if (!content) {
    removeMeta('name', 'robots');
    return;
  }
  upsertMeta('name', 'robots', content);
}

/**
 * Applies title, description, keywords, canonical, Open Graph and Twitter
 * card tags for the current route. JSON-LD is intentionally handled by a
 * separate function (applyJsonLd) so runtime tag mutation stays separate.
 */
export function applyHeadMeta(seo: SeoData) {
  setTitleMeta(seo.title);

  if (seo.description) upsertMeta('name', 'description', seo.description);
  else removeMeta('name', 'description');

  if (seo.keywords) upsertMeta('name', 'keywords', seo.keywords);
  else removeMeta('name', 'keywords');

  setCanonical(seo.path ? `${SITE_URL}${seo.path}` : null);

  const ogType = seo.type ?? 'website';
  upsertMeta('property', 'og:type', ogType);
  upsertMeta('property', 'og:title', seo.title);
  upsertMeta('property', 'og:description', seo.description ?? SITE_DESCRIPTION);
  if (seo.path) upsertMeta('property', 'og:url', `${SITE_URL}${seo.path}`);
  else removeMeta('property', 'og:url');
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:locale', 'ko_KR');
  if (seo.image) upsertMeta('property', 'og:image', seo.image);
  else removeMeta('property', 'og:image');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', seo.title);
  upsertMeta('name', 'twitter:description', seo.description ?? SITE_DESCRIPTION);
  if (seo.image) upsertMeta('name', 'twitter:image', seo.image);
  else removeMeta('name', 'twitter:image');

  setRobots(seo.robots ?? null);
}

export function applyJsonLd(schema: object | object[] | null) {
  removeJsonLd();
  if (!schema) return;
  const list = Array.isArray(schema) ? schema : [schema];
  for (const item of list) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-readdy-seo', 'true');
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  }
}

export function removeJsonLd() {
  document.head.querySelectorAll('script[data-readdy-seo]').forEach((el) => el.remove());
}

// --- Override store (pages with dynamic data push their SEO here) ---
let override: SeoData | null = null;
const listeners = new Set<() => void>();

export function setSeoOverride(data: SeoData | null) {
  override = data;
  listeners.forEach((l) => l());
}

export function getSeoOverride(): SeoData | null {
  return override;
}

export function subscribeSeoOverride(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}