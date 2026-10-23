import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 라우트가 바뀔 때 스크롤을 맨 위로 올리고,
 * #해시가 있으면 해당 요소로 부드럽게 이동시킨다.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.replace('#', ''));
      if (!id) return undefined;

      const scrollToHash = () => {
        const el = document.getElementById(id);
        if (!el) return false;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      };

      // 콘텐츠가 비동기로 늦게 렌더될 수 있어 여러 번 시도한다.
      if (!scrollToHash()) {
        const timers = [320, 800, 1500].map((ms) => window.setTimeout(scrollToHash, ms));
        return () => timers.forEach((t) => window.clearTimeout(t));
      }
      return undefined;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash]);

  return null;
}