import { Link, useLocation } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 items-center justify-center px-4 py-16 md:px-6 md:py-24">
        <div className="relative w-full max-w-lg text-center">
          <span className="pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 select-none font-heading text-[7rem] font-black leading-none text-accent-100 md:text-[10rem]">
            404
          </span>

          <div className="relative z-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-compass-3-line text-3xl" />
            </span>
            <h1 className="mt-6 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
              페이지를 찾을 수 없어요
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-foreground-600">
              주소가 바뀌었거나 삭제된 페이지예요. 아래에서 원하는 곳으로 이동해보세요.
            </p>
            <p className="mt-3 inline-block max-w-full truncate rounded-md bg-background-100 px-3 py-1.5 font-mono text-xs text-foreground-500">
              {location.pathname}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
              >
                <i className="ri-home-5-line" />
                홈으로 가기
              </Link>
              <Link
                to="/boards"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-5 py-2.5 text-sm font-medium text-foreground-800 transition-colors hover:border-primary-300 hover:text-primary-700 cursor-pointer"
              >
                <i className="ri-layout-grid-line" />
                게시판 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}