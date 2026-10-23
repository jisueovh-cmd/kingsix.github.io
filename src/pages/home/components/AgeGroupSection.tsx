import { Link } from 'react-router-dom';

interface AgeGroup {
  slug: string;
  decade: string;
  name: string;
  tagline: string;
  icon: string;
  tone: 'primary' | 'accent' | 'secondary';
}

const AGE_GROUPS: AgeGroup[] = [
  {
    slug: 'age-10',
    decade: '10대',
    name: '10대 취미방',
    tagline: '요즘 10대가 빠져 있는 취미와 놀이',
    icon: 'ri-emotion-happy-line',
    tone: 'accent',
  },
  {
    slug: 'age-20',
    decade: '20대',
    name: '20대 취미방',
    tagline: '20대의 핫플과 요즘 빠진 취미 공유',
    icon: 'ri-fire-line',
    tone: 'primary',
  },
  {
    slug: 'age-30',
    decade: '30대',
    name: '30대 취미방',
    tagline: '30대의 취미와 일상, 요즘 관심사',
    icon: 'ri-cup-line',
    tone: 'secondary',
  },
  {
    slug: 'age-40',
    decade: '40대',
    name: '40대 취미방',
    tagline: '40대의 여유로운 취미와 생활 이야기',
    icon: 'ri-plant-line',
    tone: 'accent',
  },
  {
    slug: 'age-50',
    decade: '50대',
    name: '50대 취미방',
    tagline: '50대의 취미와 새로운 도전',
    icon: 'ri-camera-lens-line',
    tone: 'primary',
  },
  {
    slug: 'age-60',
    decade: '60대',
    name: '60대 취미방',
    tagline: '60대의 풍요로운 취미 생활',
    icon: 'ri-sun-line',
    tone: 'secondary',
  },
];

const TONE: Record<
  AgeGroup['tone'],
  { bubble: string; ring: string; label: string; hover: string }
> = {
  primary: {
    bubble: 'bg-primary-100 text-primary-700',
    ring: 'border-primary-200',
    label: 'text-primary-700',
    hover: 'group-hover:border-primary-300',
  },
  accent: {
    bubble: 'bg-accent-100 text-accent-700',
    ring: 'border-accent-200',
    label: 'text-accent-700',
    hover: 'group-hover:border-accent-300',
  },
  secondary: {
    bubble: 'bg-secondary-100 text-secondary-800',
    ring: 'border-secondary-200',
    label: 'text-secondary-800',
    hover: 'group-hover:border-secondary-300',
  },
};

export default function AgeGroupSection() {
  return (
    <section id="age-groups">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-label uppercase tracking-[0.2em] text-primary-600">
            10s &mdash; 60s
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            나이대별 취미
          </h2>
          <p className="mt-1.5 text-xs text-foreground-600 md:text-sm">
            세대마다 다른 취미와 노는 법 &mdash; 내 또래 방에서 함께 나눠요
          </p>
        </div>
        <Link
          to="/board/age-20"
          className="hidden items-center gap-1 whitespace-nowrap text-sm text-foreground-600 transition-colors hover:text-primary-700 sm:flex cursor-pointer"
        >
          20대 방 바로가기
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {AGE_GROUPS.map((g) => {
          const tone = TONE[g.tone];
          return (
            <Link
              key={g.slug}
              to={`/board/${g.slug}`}
              className={`group flex w-[260px] shrink-0 snap-start items-center gap-4 rounded-lg border ${tone.ring} ${tone.hover} bg-background-50 p-4 transition-colors sm:w-auto sm:shrink sm:p-5 cursor-pointer`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tone.bubble} md:h-14 md:w-14`}
              >
                <i className={`${g.icon} text-2xl`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-label ${tone.label}`}>{g.decade}</p>
                <h3 className="mt-0.5 font-heading text-base font-bold text-foreground-900 transition-colors group-hover:text-primary-700">
                  {g.name}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-foreground-500">{g.tagline}</p>
              </div>
              <i className="ri-arrow-right-s-line shrink-0 text-xl text-foreground-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary-600" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}