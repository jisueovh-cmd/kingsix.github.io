const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,}$/;

/** 유튜브 URL에서 영상 ID를 추출한다. 유튜브가 아니면 null. */
export function getYouTubeId(rawUrl: string): string | null {
  const value = rawUrl.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const isYouTube =
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtu.be' ||
    host === 'youtube-nocookie.com';
  if (!isYouTube) return null;

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && YOUTUBE_ID.test(id) ? id : null;
  }

  if (url.pathname === '/watch') {
    const id = url.searchParams.get('v');
    return id && YOUTUBE_ID.test(id) ? id : null;
  }

  const parts = url.pathname.split('/').filter(Boolean);
  const first = parts[0];
  if (first === 'embed' || first === 'shorts' || first === 'live' || first === 'v') {
    const id = parts[1];
    return id && YOUTUBE_ID.test(id) ? id : null;
  }

  return null;
}

/** 본문 한 줄이 유튜브 링크만으로 이루어졌다면 임베드 주소를 돌려준다. */
export function getYouTubeEmbedFromLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const markdown = trimmed.match(/^\[[^\]]*\]\((https?:\/\/[^\s)]+)\)$/);
  const candidate = markdown ? markdown[1] : trimmed;
  if (!/^https?:\/\//i.test(candidate)) return null;

  const id = getYouTubeId(candidate);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}