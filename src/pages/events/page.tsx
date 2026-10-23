import { Link } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import { mockEvents } from '@/mocks/content';

export default function EventsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-10">
        <div className="mb-8">
          <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
            <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
              홈
            </Link>
            <i className="ri-arrow-right-s-line" />
            <span className="text-foreground-800">이벤트</span>
          </nav>
          <h1 className="font-heading text-2xl font-bold text-foreground-950 md:text-3xl">이벤트</h1>
          <p className="mt-1 text-sm text-foreground-600">
            취미를 더 즐겁게 만드는 다양한 이벤트와 챌린지에 참여해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockEvents.map((event) => (
            <article
              key={event.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50 transition-colors hover:border-primary-300"
            >
              <div className="h-[190px] w-full overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent-100 px-2.5 py-1 text-[10px] font-label text-accent-800">
                    {event.tag}
                  </span>
                  <span className="text-xs text-foreground-400">{event.date}</span>
                </div>
                <h2 className="mt-3 font-heading text-base font-bold text-foreground-900 transition-colors group-hover:text-primary-700">
                  {event.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground-600">
                  {event.description}
                </p>
                <Link
                  to="/write"
                  className="mt-4 inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
                >
                  참여하기
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-lg bg-accent-100/60 p-8 text-center">
          <h2 className="font-heading text-xl font-bold text-foreground-950">
            이벤트에 참여하고 싶다면?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground-700">
            지금 바로 취미 이야기를 남기고, 커뮤니티와 함께 즐겨보세요.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              to="/write"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-6 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              <i className="ri-edit-line" />
              글 남기기
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-6 py-2.5 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
            >
              콘텐츠 둘러보기
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}