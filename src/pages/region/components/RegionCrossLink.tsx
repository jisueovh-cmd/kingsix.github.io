import { Link } from 'react-router-dom';

interface RegionCrossLinkProps {
  to: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  highlights?: string[];
}

/**
 * 지역 정보 게시판끼리 서로 오갈 수 있게 해주는 안내 배너.
 * 군포·수도권 페이지 ↔ 전국 지역 정보 페이지 양쪽에서 공용으로 사용한다.
 */
export default function RegionCrossLink({
  to,
  eyebrow,
  title,
  description,
  ctaLabel,
  highlights = [],
}: RegionCrossLinkProps) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-8 hidden h-40 w-40 rounded-full bg-accent-100/70 md:block"
      />
      <div className="relative flex flex-col gap-5 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-7">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-background-50">
            <i className="ri-earth-line text-2xl" />
          </span>
          <div>
            <p className="text-xs font-label uppercase tracking-[0.2em] text-secondary-800">
              {eyebrow}
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold text-foreground-950 md:text-xl">
              {title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              {description}
            </p>
            {highlights.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {highlights.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary-900"
                  >
                    <i className="ri-checkbox-circle-line text-base text-accent-600" />
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <Link
          to={to}
          className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-accent-600 md:w-auto cursor-pointer"
        >
          {ctaLabel}
          <i className="ri-arrow-right-line text-base" />
        </Link>
      </div>
    </section>
  );
}