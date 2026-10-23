import { Link } from 'react-router-dom';
import { mockEvents } from '@/mocks/content';

export default function EventsSection() {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-label uppercase tracking-[0.2em] text-primary-600">
            EVENTS
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            지금 진행중인 이벤트
          </h2>
        </div>
        <Link
          to="/events"
          className="hidden items-center gap-1 whitespace-nowrap text-sm text-foreground-600 transition-colors hover:text-primary-700 sm:flex cursor-pointer"
        >
          모두 보기
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {mockEvents.map((event) => (
          <article
            key={event.id}
            className="group overflow-hidden rounded-lg border border-background-200 bg-background-50 transition-colors hover:border-primary-300"
          >
            <div className="h-[160px] w-full overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent-100 px-2.5 py-1 text-[10px] font-label text-accent-800">
                  {event.tag}
                </span>
                <span className="text-xs text-foreground-400">{event.date}</span>
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-foreground-900">
                {event.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground-600">
                {event.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}