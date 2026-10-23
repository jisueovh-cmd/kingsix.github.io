import { Link } from 'react-router-dom';
import { mockCategories } from '@/mocks/content';

export default function CategoryGrid() {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-label uppercase tracking-[0.2em] text-primary-600">
            DISCOVER HOBBIES
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            취미를 발견해보세요
          </h2>
        </div>
        <span className="hidden text-xs font-label uppercase tracking-[0.2em] text-foreground-400 md:block">
          HOBBY SPACES
        </span>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {mockCategories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="group relative block w-[240px] shrink-0 snap-start overflow-hidden rounded-lg bg-background-100 sm:w-auto sm:shrink cursor-pointer"
          >
            <div className="h-[220px] w-full overflow-hidden sm:h-[240px]">
              <img
                src={cat.cover_image}
                alt={cat.name}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/85 via-foreground-950/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background-50/90 text-primary-700">
                <i className={`${cat.icon} text-lg`} />
              </span>
              <h3 className="mt-3 font-heading text-lg font-bold text-background-50">{cat.name}</h3>
              <p className="mt-0.5 text-xs text-background-100/90">{cat.tagline}</p>
            </div>
            <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background-50/90 text-primary-700 transition-transform duration-300 group-hover:translate-x-0.5">
              <i className="ri-arrow-right-up-line" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}