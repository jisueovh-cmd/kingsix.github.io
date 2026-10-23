import RichContent from '@/components/feature/RichContent';
import { getYouTubeId } from '@/lib/youtube';
import type { PostLink } from '@/types/home';

interface PostBodyProps {
  content: string | null;
  images?: string[] | null;
  videos?: string[] | null;
  tags?: string[] | null;
  links?: PostLink[] | null;
  location?: string | null;
}

export default function PostBody({
  content,
  images,
  videos,
  tags,
  links,
  location,
}: PostBodyProps) {
  const imageList = (images ?? []).filter(Boolean);
  const cover = imageList[0] ?? null;
  const rest = imageList.slice(1);
  const videoList = (videos ?? []).filter(Boolean);
  const tagList = (tags ?? []).filter(Boolean);
  const linkList = (links ?? []).filter((l) => l && l.url);
  const youtubeLinks = linkList.filter((l) => Boolean(getYouTubeId(l.url)));
  const normalLinks = linkList.filter((l) => !getYouTubeId(l.url));
  const hasLocation = Boolean(location && location.trim());

  return (
    <div className="space-y-6">
      {cover && (
        <div className="overflow-hidden rounded-lg border border-background-200 bg-background-100">
          <img
            src={cover}
            alt="대표 이미지"
            className="h-auto max-h-[560px] w-full object-cover object-top"
          />
        </div>
      )}

      <RichContent
        text={content ?? '내용이 없습니다.'}
        className="space-y-3 text-sm leading-relaxed text-foreground-800 md:text-base"
      />

      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rest.map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-lg border border-background-200 bg-background-100"
            >
              <img
                src={src}
                alt="첨부 이미지"
                className="h-[180px] w-full object-cover object-top"
              />
            </div>
          ))}
        </div>
      )}

      {videoList.length > 0 && (
        <div className="space-y-3">
          {videoList.map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-lg border border-background-200 bg-foreground-950"
            >
              <video
                src={src}
                controls
                playsInline
                preload="metadata"
                className="h-auto max-h-[560px] w-full bg-foreground-950 object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {tagList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tagList.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-3 py-1 text-xs text-secondary-900"
            >
              <i className="ri-hashtag" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {hasLocation && (
        <div className="overflow-hidden rounded-lg border border-background-200">
          <div className="flex items-center gap-1.5 border-b border-background-200 bg-background-100/70 px-4 py-2.5 text-xs font-medium text-foreground-700">
            <i className="ri-map-pin-line text-primary-600" />
            {location}
          </div>
          <iframe
            title="위치 지도"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(location ?? '')}&z=15&output=embed`}
            className="h-[300px] w-full border-0"
          />
        </div>
      )}

      {linkList.length > 0 && (
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground-950">
            <i className="ri-link text-primary-600" />
            첨부 링크
          </h3>

          {youtubeLinks.length > 0 && (
            <div className="mt-3 space-y-3">
              {youtubeLinks.map((link) => {
                const id = getYouTubeId(link.url);
                if (!id) return null;
                return (
                  <div
                    key={link.url}
                    className="overflow-hidden rounded-lg border border-background-200 bg-foreground-950"
                  >
                    {link.title?.trim() && (
                      <div className="flex items-center gap-1.5 bg-background-100/80 px-3 py-2 text-xs font-medium text-foreground-800">
                        <i className="ri-youtube-fill text-primary-600" />
                        <span className="truncate">{link.title.trim()}</span>
                      </div>
                    )}
                    <div className="aspect-video w-full">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${id}`}
                        title={link.title?.trim() || '유튜브 동영상'}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {normalLinks.length > 0 && (
            <ul className="mt-3 space-y-2">
              {normalLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="group flex items-center gap-2 rounded-md border border-background-200 bg-background-50 px-3 py-2 text-sm transition-colors hover:border-primary-300 hover:bg-background-100"
                  >
                    <i className="ri-external-link-line shrink-0 text-primary-600" />
                    <span className="min-w-0 flex-1 truncate text-foreground-800">
                      {link.title?.trim() || link.url}
                    </span>
                    <i className="ri-arrow-right-up-line shrink-0 text-foreground-400 group-hover:text-primary-600" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}