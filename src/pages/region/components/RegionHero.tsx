import { Link } from 'react-router-dom';
import type { RegionHubConfig } from '@/lib/region';

interface RegionHeroProps {
  hub: RegionHubConfig;
  total: number;
  todayCount: number;
}

export default function RegionHero({ hub, total, todayCount }: RegionHeroProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-lg">
      <div className="absolute inset-0">
        <img
          src={hub.hero.image}
          alt={`${hub.name} 배경 일러스트`}
          title={hub.name}
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />
      </div>

      <div className="relative w-full px-5 py-9 md:px-10 md:py-14">
        <div className="flex flex-wrap items-center gap-2">
          {hub.hero.badges.map((badge) => (
            <span
              key={badge.label}
              className={
                badge.style === 'accent'
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-accent-500/90 px-3 py-1 text-xs font-label text-background-50'
                  : 'inline-flex items-center gap-1.5 rounded-full bg-background-50/15 px-3 py-1 text-xs font-label text-background-50 backdrop-blur'
              }
            >
              {badge.pulse ? (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
              ) : (
                <i className={badge.icon} />
              )}
              {badge.label}
            </span>
          ))}
        </div>

        <h1 className="mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight text-background-50 md:text-5xl">
          {hub.hero.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-background-100 md:text-base">
          {hub.hero.subtitle}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <Link
            to={`/board/${hub.slug}/write`}
            className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-background-50 px-5 py-3 text-sm font-semibold text-foreground-900 transition-colors hover:bg-background-100 sm:w-auto cursor-pointer"
          >
            <i className="ri-edit-line" />
            {hub.writeLabel}
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <p className="font-heading text-2xl font-bold text-background-50">{total.toLocaleString()}</p>
            <p className="mt-0.5 text-xs font-label text-background-100/80">등록된 정보</p>
          </div>
          <div className="w-px bg-background-50/25" />
          <div>
            <p className="font-heading text-2xl font-bold text-background-50">{todayCount.toLocaleString()}</p>
            <p className="mt-0.5 text-xs font-label text-background-100/80">오늘 새 정보</p>
          </div>
          <div className="w-px bg-background-50/25" />
          <div>
            <p className="font-heading text-2xl font-bold text-background-50">{hub.hero.statRegionValue}</p>
            <p className="mt-0.5 text-xs font-label text-background-100/80">{hub.hero.statRegionLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}