import type { ReactNode } from 'react';
import { getYouTubeEmbedFromLine } from '@/lib/youtube';
import { isHtmlContent, sanitizeHtml } from '@/lib/sanitizeHtml';

const INLINE_PATTERN =
  /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|~~[^~\n]+~~|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s]+)/g;

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let counter = 0;
  let match: RegExpExecArray | null;
  INLINE_PATTERN.lastIndex = 0;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${counter}`;
    counter += 1;

    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={key} className="font-bold text-foreground-950">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      nodes.push(
        <del key={key} className="text-foreground-500">
          {token.slice(2, -2)}
        </del>,
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-background-100 px-1.5 py-0.5 text-[0.85em] text-primary-700"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="break-all text-primary-700 underline underline-offset-2"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('http')) {
      nodes.push(
        <a
          key={key}
          href={token}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="break-all text-primary-700 underline underline-offset-2"
        >
          {token}
        </a>,
      );
    } else {
      nodes.push(token);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

interface RichContentProps {
  text: string | null;
  className?: string;
}

export default function RichContent({ text, className }: RichContentProps) {
  const source = text ?? '';

  if (isHtmlContent(source)) {
    return (
      <div
        className={className ? `rich-text ${className}` : 'rich-text'}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(source) }}
      />
    );
  }

  const lines = source.split('\n');
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];
  let quoteBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const key = `ul-${blocks.length}`;
    blocks.push(
      <ul key={key} className="my-2 list-disc space-y-1 pl-5">
        {listBuffer.map((item, i) => (
          <li key={`${key}-${i}`}>{parseInline(item, `${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  const flushQuote = () => {
    if (quoteBuffer.length === 0) return;
    const key = `bq-${blocks.length}`;
    blocks.push(
      <blockquote
        key={key}
        className="my-2 rounded-md border-l-4 border-primary-300 bg-background-100/70 px-4 py-2 text-foreground-700"
      >
        {quoteBuffer.map((line, i) => (
          <p key={`${key}-${i}`}>{parseInline(line, `${key}-${i}`)}</p>
        ))}
      </blockquote>,
    );
    quoteBuffer = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.replace(/\s+$/, '');
    if (/^[-*]\s+/.test(line)) {
      flushQuote();
      listBuffer.push(line.replace(/^[-*]\s+/, ''));
      return;
    }
    if (/^>\s?/.test(line)) {
      flushList();
      quoteBuffer.push(line.replace(/^>\s?/, ''));
      return;
    }
    flushList();
    flushQuote();
    const imageMatch = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
    if (imageMatch) {
      blocks.push(
        <div
          key={`img-${idx}`}
          className="my-2 overflow-hidden rounded-lg border border-background-200 bg-background-100"
        >
          <img
            src={imageMatch[2]}
            alt={imageMatch[1] || '본문 이미지'}
            className="h-auto max-h-[560px] w-full object-cover object-top"
          />
        </div>,
      );
      return;
    }
    const embedUrl = getYouTubeEmbedFromLine(line);
    if (embedUrl) {
      blocks.push(
        <div
          key={`yt-${idx}`}
          className="my-3 w-full max-w-2xl overflow-hidden rounded-lg border border-background-200 bg-foreground-950"
        >
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title="유튜브 동영상"
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>,
      );
      return;
    }
    if (line.trim() === '') {
      blocks.push(<div key={`sp-${idx}`} className="h-3" />);
      return;
    }
    blocks.push(
      <p key={`p-${idx}`}>{parseInline(line, `p-${idx}`)}</p>,
    );
  });
  flushList();
  flushQuote();

  return <div className={className}>{blocks}</div>;
}