import { Link } from 'react-router-dom';
import { SITE_TAGLINE } from '@/lib/nav';

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden rounded-lg">
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=Warm%20editorial%20illustration%20of%20a%20cozy%20creative%20studio%20filled%20with%20plants%2C%20a%20camera%2C%20an%20open%20journal%2C%20art%20supplies%20and%20soft%20sunlight%2C%20cream%20and%20terracotta%20and%20sage%20green%20palette%2C%20modern%20lifestyle%20magazine%20cover%2C%20airy%20flat%20illustration%20with%20subtle%20grain&width=1600&height=900&seq=hero-japari-v2&orientation=landscape"
          alt="취미 in 자파리"
          className="h-full w-full object-cover object-top"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-foreground-950/75 via-foreground-950/45 to-foreground-950/25" />

      <div className="relative z-10 flex min-h-[420px] w-full flex-col justify-center px-5 py-10 md:min-h-[560px] md:px-12 md:py-12">
        <div className="max-w-2xl animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-background-50/90 px-4 py-1.5 text-xs font-label tracking-wide text-primary-800">
            <i className="ri-sparkling-line" />
            취미로 연결되는 공간
          </span>
          <h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-background-50 md:text-5xl">
            취미 in 자파리
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-background-100 md:text-base">
            {SITE_TAGLINE}
            <br className="hidden sm:block" />
            여행, 정원, 맛집, 만들기 — 나만의 취미를 기록하고, 새로운 취미를 발견해보세요.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/explore"
              className="w-full whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-center text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 sm:w-auto cursor-pointer"
            >
              콘텐츠 둘러보기
            </Link>
            <a
              href="#community"
              className="w-full whitespace-nowrap rounded-md border border-background-50/60 bg-background-50/10 px-5 py-3 text-center text-sm font-medium text-background-50 backdrop-blur-sm transition-colors hover:bg-background-50/20 sm:w-auto cursor-pointer"
            >
              사람들과 함께하기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}