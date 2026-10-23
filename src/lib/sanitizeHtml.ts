const ALLOWED_TAGS = new Set([
  'p',
  'div',
  'span',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'strike',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'img',
  'code',
  'pre',
  'h2',
  'h3',
  'h4',
  'hr',
  'iframe',
]);

const REMOVE_TAGS = new Set([
  'script',
  'style',
  'noscript',
  'svg',
  'math',
  'template',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'link',
  'meta',
]);

const ATTR_WHITELIST: Record<string, string[]> = {
  a: ['href'],
  img: ['src', 'alt', 'style'],
  iframe: ['src', 'title', 'allow', 'allowfullscreen', 'referrerpolicy'],
};

const YOUTUBE_EMBED = /^https:\/\/(www\.)?(youtube-nocookie\.com|youtube\.com)\/embed\//;

function sanitizeElement(el: Element) {
  const tag = el.tagName.toLowerCase();

  if (REMOVE_TAGS.has(tag)) {
    el.remove();
    return;
  }

  const allowed = ATTR_WHITELIST[tag] ?? [];
  Array.from(el.attributes).forEach((attr) => {
    if (!allowed.includes(attr.name.toLowerCase())) {
      el.removeAttribute(attr.name);
    }
  });

  if (tag === 'a') {
    const href = el.getAttribute('href') ?? '';
    if (!/^(https?:\/\/|mailto:|\/)/i.test(href)) {
      el.removeAttribute('href');
    } else {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer nofollow');
    }
  }

  if (tag === 'iframe') {
    const src = el.getAttribute('src') ?? '';
    if (!YOUTUBE_EMBED.test(src)) {
      el.remove();
      return;
    }
    el.setAttribute('class', 'yt-embed');
    el.setAttribute('title', '유튜브 영상');
    el.setAttribute('loading', 'lazy');
  }

  if (tag === 'img') {
    const src = el.getAttribute('src') ?? '';
    if (!/^(https?:\/\/|data:image\/)/i.test(src)) {
      el.remove();
      return;
    }
    if (!el.getAttribute('alt')) {
      el.setAttribute('alt', '본문 이미지');
    }
    // 크기 조절로 남은 width(px)만 안전하게 보존한다. 그 외 스타일은 제거.
    const style = el.getAttribute('style') ?? '';
    const widthMatch = style.match(/(?:^|;)\s*width\s*:\s*([\d.]+)\s*px/i);
    const px = widthMatch ? Math.round(Number(widthMatch[1])) : 0;
    if (px >= 40 && px <= 2000) {
      el.setAttribute('style', `width: ${px}px; height: auto;`);
    } else {
      el.removeAttribute('style');
    }
  }

  Array.from(el.children).forEach(sanitizeElement);
}

/** 본문 문자열이 편집기에서 만든 HTML인지 판단한다. (기존 마크다운 글과 구분) */
export function isHtmlContent(text: string | null | undefined): boolean {
  if (!text) return false;
  return /<(p|div|br|img|ul|ol|li|blockquote|h[1-6]|a|strong|em|u|s|del|span|iframe|pre|code)(\s|>|\/)/i.test(
    text,
  );
}

/** 위험한 태그·속성을 걷어낸 안전한 HTML을 돌려준다. */
export function sanitizeHtml(input: string | null | undefined): string {
  const source = input ?? '';
  if (!source) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(`<div id="rich-root">${source}</div>`, 'text/html');
  const root = doc.getElementById('rich-root');
  if (!root) return '';
  Array.from(root.children).forEach(sanitizeElement);
  return root.innerHTML;
}

/** 내용이 사실상 비어 있는지 확인한다. (이미지/영상만 있어도 내용으로 본다) */
export function isHtmlEmpty(html: string | null | undefined): boolean {
  const source = html ?? '';
  if (!source.trim()) return true;
  if (/<(img|iframe)\b/i.test(source)) return false;
  const text = source
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, '')
    .replace(/\s+/g, '');
  return text.length === 0;
}