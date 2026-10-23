import { Link } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import Guidelines from '@/pages/about/components/Guidelines';
import { mockCategories } from '@/mocks/content';

const VALUES = [
  {
    icon: 'ri-heart-3-line',
    title: '진입 장벽 없는 공유',
    desc: '회원가입 없이도 닉네임만으로 글을 남길 수 있어요. 누구나 편하게 시작할 수 있어요.',
  },
  {
    icon: 'ri-lightbulb-line',
    title: '새로운 취미 발견',
    desc: '다른 사람의 이야기를 통해 미처 몰랐던 취미를 만나보세요. 취미는 서로에게 전염돼요.',
  },
  {
    icon: 'ri-community-line',
    title: '따뜻한 커뮤니티',
    desc: '완벽하지 않아도 괜찮아요. 서로 응원하고 함께 성장하는 아지트예요.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 md:py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
          <Link to="/" className="transition-colors hover:text-primary-700 cursor-pointer">
            홈
          </Link>
          <i className="ri-arrow-right-s-line" />
          <span className="text-foreground-800">ABOUT</span>
        </nav>

        <section className="relative overflow-hidden rounded-lg">
          <div className="absolute inset-0">
            <img
              src="https://readdy.ai/api/search-image?query=Warm%20editorial%20illustration%20of%20a%20cozy%20community%20gathering%20space%20with%20people%20sharing%20hobbies%2C%20plants%2C%20crafts%20and%20food%20around%20a%20table%2C%20cream%20and%20terracotta%20and%20sage%20green%20palette%2C%20modern%20magazine%20about%20page%20cover%2C%20airy%20flat%20illustration%20with%20grain&width=1600&height=700&seq=about-hero&orientation=landscape"
              alt="취미 in 자파리 소개"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-foreground-950/75 via-foreground-950/40 to-foreground-950/20" />
          <div className="relative z-10 flex min-h-[320px] flex-col justify-center px-6 py-12 md:min-h-[400px] md:px-12">
            <p className="text-xs font-label uppercase tracking-[0.2em] text-background-100">
              HOBBY IN JAPARI
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-background-50 md:text-5xl">
              취미로 연결되는 우리들의 아지트
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-background-100 md:text-base">
              좋아하는 것을 나누는 것, 그것이 모든 것의 시작이에요.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
              취미 in 자파리란?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground-700 md:text-base">
              취미 in 자파리는 각자의 소소한 취미를 기록하고 나누는 공간이에요. 여행, 정원, 맛집,
              만들기, 수집까지 — 사람마다 저마다의 취미가 있고, 그 이야기 하나하나가 모여 우리만의
              작은 세계를 만들어가요.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground-700 md:text-base">
              특별할 것 없는 평범한 하루도, 기록하고 나누는 순간 특별해져요. 완벽한 글일 필요도,
              대단한 취미일 필요도 없어요. 그저 좋아하는 것을 꺼내 보여주는 것. 그것이 취미 in
              자파리가 추구하는 전부예요.
            </p>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-lg border border-background-200 bg-background-50 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <i className={`${v.icon} text-xl`} />
              </span>
              <h3 className="mt-4 font-heading text-base font-bold text-foreground-950">{v.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-600">{v.desc}</p>
            </div>
          ))}
        </section>

        <Guidelines />

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            취미를 만나보세요
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            {mockCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group flex items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-300 cursor-pointer"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
                  <i className={`${cat.icon} text-lg`} />
                </span>
                <span className="font-heading text-sm font-bold text-foreground-900 transition-colors group-hover:text-primary-700">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-lg bg-accent-100/60 p-8 text-center md:p-12">
          <h2 className="font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            함께 시작해볼까요?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground-700">
            지금 바로 여러분의 취미 이야기를 남겨보세요. 첫 마디가 곧 시작이에요.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/write"
              className="whitespace-nowrap rounded-md bg-primary-500 px-6 py-2.5 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              글쓰기
            </Link>
            <Link
              to="/explore"
              className="whitespace-nowrap rounded-md border border-accent-300 bg-background-50 px-6 py-2.5 text-sm font-medium text-accent-800 transition-colors hover:bg-accent-100 cursor-pointer"
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