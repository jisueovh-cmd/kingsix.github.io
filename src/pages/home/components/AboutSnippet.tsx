import { Link } from 'react-router-dom';

export default function AboutSnippet() {
  return (
    <section className="overflow-hidden rounded-lg bg-accent-100/60">
      <div className="grid grid-cols-1 gap-8 px-6 py-10 md:px-12 md:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-xs font-label uppercase tracking-[0.2em] text-accent-700">
            ABOUT US
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            취미로 연결되는 따뜻한 아지트
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground-700">
            취미 in 자파리는 각자의 소소한 취미를 기록하고, 서로의 이야기를 통해 새로운 취미를
            발견하는 공간이에요. 완벽하지 않아도 괜찮아요. 그저 좋아하는 것을 나누는 것, 그것이
            우리의 시작이에요.
          </p>
          <Link
            to="/about"
            className="mt-6 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-accent-500 px-5 py-2.5 text-sm font-medium text-accent-50 transition-colors hover:bg-accent-600 cursor-pointer"
          >
            자세히 알아보기
            <i className="ri-arrow-right-line" />
          </Link>
        </div>
        <div className="hidden lg:block">
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-background-50 text-accent-600">
            <i className="ri-plant-line text-5xl" />
          </span>
        </div>
      </div>
    </section>
  );
}