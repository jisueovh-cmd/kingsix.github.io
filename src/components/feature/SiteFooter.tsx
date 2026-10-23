import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NAV_BOARDS, SITE_NAME, SITE_TAGLINE } from '@/lib/nav';
import { SITE_URL } from '@/lib/seo';
import FeedbackModal from '@/components/feature/FeedbackModal';
import { useDailyVisits } from '@/hooks/useDailyVisits';
import { useOnlineCount } from '@/hooks/usePresence';

export default function SiteFooter() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { count, total } = useDailyVisits();
  const online = useOnlineCount();

  const shareUrl = encodeURIComponent(SITE_URL);
  const shareText = encodeURIComponent(`${SITE_NAME} — ${SITE_TAGLINE}`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
    } catch {
      // 클립보드 실패는 무시
    }
  };

  return (
    <>
      <footer className="mt-16 border-t border-background-200 bg-accent-100/60">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-10 md:px-6 md:py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-accent-50">
                  <i className="ri-plant-line text-xl" />
                </span>
                <span className="font-heading text-xl font-bold text-foreground-950">{SITE_NAME}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground-700">{SITE_TAGLINE}</p>
              <p className="mt-4 text-xs text-foreground-600">
                취미를 기록하고 나누는 우리들의 작은 아지트.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  aria-label="X로 공유"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-200 bg-background-50 text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
                >
                  <i className="ri-twitter-x-line text-base" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  aria-label="페이스북으로 공유"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-200 bg-background-50 text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
                >
                  <i className="ri-facebook-line text-base" />
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label="링크 복사"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-200 bg-background-50 text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
                >
                  <i className="ri-link text-base" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-10">
              <div>
                <h4 className="mb-3 font-heading text-sm font-bold text-foreground-900">게시판</h4>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {NAV_BOARDS.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={`/board/${item.slug}`}
                        className="text-sm text-foreground-700 transition-colors hover:text-primary-700 cursor-pointer"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-heading text-sm font-bold text-foreground-900">기록방</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/room"
                      className="text-sm text-foreground-700 transition-colors hover:text-primary-700 cursor-pointer"
                    >
                      내 기록방
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/boards"
                      className="text-sm text-foreground-700 transition-colors hover:text-primary-700 cursor-pointer"
                    >
                      게시판 모음
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/people"
                      className="text-sm text-foreground-700 transition-colors hover:text-primary-700 cursor-pointer"
                    >
                      사람들
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-heading text-sm font-bold text-foreground-900">운영</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/about#guidelines"
                      className="text-sm text-foreground-700 transition-colors hover:text-primary-700 cursor-pointer"
                    >
                      커뮤니티 가이드
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setFeedbackOpen(true)}
                      className="text-sm text-foreground-700 transition-colors hover:text-primary-700 cursor-pointer"
                    >
                      의견 보내기
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="text-sm text-foreground-700 transition-colors hover:text-primary-700 cursor-pointer"
                    >
                      ABOUT
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-accent-200 pt-6 text-xs text-foreground-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 {SITE_NAME}. 소소한 하루의 기록.</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {online !== null && (
                <p className="flex items-center gap-1.5" title="지금 사이트에 접속 중인 사람 수">
                  <span className="relative flex h-2 w-2 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
                  </span>
                  <span>지금</span>
                  <strong className="font-semibold text-foreground-800">{online.toLocaleString()}</strong>
                  <span>명 접속 중</span>
                </p>
              )}
              {count !== null && (
                <p className="flex items-center gap-1.5" title="한국시간 0시 기준 오늘 순 방문자 수">
                  <i className="ri-eye-line text-accent-600" />
                  <span>오늘</span>
                  <strong className="font-semibold text-foreground-800">{count.toLocaleString()}</strong>
                  <span>명 방문</span>
                </p>
              )}
              {total !== null && (
                <p className="flex items-center gap-1.5" title="전체 기간 누적 순 방문자 수">
                  <i className="ri-user-voice-line text-secondary-600" />
                  <span>누적</span>
                  <strong className="font-semibold text-foreground-800">{total.toLocaleString()}</strong>
                  <span>명 방문</span>
                </p>
              )}
              <p className="flex items-center gap-1.5">
                <i className="ri-heart-3-line text-primary-500" />
                취미로 연결된 사람들
              </p>
            </div>
          </div>
        </div>
      </footer>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </>
  );
}