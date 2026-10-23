// Schema.org JSON-LD builders. Kept separate from runtime OG/Twitter tag
// mutation so structured data injection stays isolated and easy to audit.

import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from './seo';

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: '취미 자파리',
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'ko',
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: '취미 자파리',
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: DEFAULT_OG_IMAGE,
    image: DEFAULT_OG_IMAGE,
  };
}

export interface CollectionPageInput {
  name: string;
  description?: string;
  url: string;
}

/**
 * Structured data for list / section pages such as category, board and
 * explore pages that gather many posts under one topic.
 */
export function collectionPageSchema(input: CollectionPageInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    url: input.url,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
  if (input.description) schema.description = input.description;
  return schema;
}

export interface BlogPostingInput {
  title: string;
  description?: string;
  authorName: string;
  datePublished: string;
  url: string;
  image?: string;
}

export function blogPostingSchema(input: BlogPostingInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    author: { '@type': 'Person', name: input.authorName },
    datePublished: input.datePublished,
    mainEntityOfPage: input.url,
  };
  if (input.description) schema.description = input.description;
  if (input.image) schema.image = input.image;
  return schema;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** FAQ 섹션용 Schema.org FAQPage 구조화 데이터. */
export function faqPageSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}