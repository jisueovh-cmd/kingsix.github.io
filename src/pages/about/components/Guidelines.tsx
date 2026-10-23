import { useState } from 'react';

const GUIDELINES = [
  {
    icon: 'ri-heart-3-line',
    title: '서로를 배려해주세요',
    desc: '모두가 편안하게 머무는 공간을 위해 비방, 욕설, 혐오 표현은 삼가주세요. 의견이 달라도 존중하며 이야기 나눠요. 상대의 취미가 나와 달라도 응원해주는 마음이 자파리의 원동력이에요.',
  },
  {
    icon: 'ri-copyright-line',
    title: '저작권을 지켜주세요',
    desc: '남의 사진이나 글을 무단으로 올리지 말아주세요. 직접 찍고, 직접 쓴 콘텐츠를 올리는 것을 권장해요. 출처가 있는 콘텐츠는 반드시 출처를 밝혀주세요.',
  },
  {
    icon: 'ri-megaphone-line',
    title: '광고와 스팸은 금지해요',
    desc: '무분별한 홍보글이나 도배는 금지돼요. 취미를 나누는 공간인 만큼, 진심이 담긴 이야기를 기대할게요. 상업적 홍보가 필요하다면 운영팀에 문의해주세요.',
  },
  {
    icon: 'ri-shield-user-line',
    title: '개인정보를 조심해주세요',
    desc: '본인이나 타인의 연락처, 주소 등 민감한 개인정보는 공개 게시글에 남기지 말아주세요. 안전한 커뮤니티를 위해 서로의 정보를 소중히 다뤄요.',
  },
  {
    icon: 'ri-flag-2-line',
    title: '문제가 보이면 알려주세요',
    desc: '불쾌한 게시글이나 댓글을 발견하면 신고해주세요. 운영팀이 빠르게 확인하고 조치할게요. 신고는 비공개로 처리돼요.',
  },
];

export default function Guidelines() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="guidelines" className="mt-12 scroll-mt-20">
      <div className="max-w-3xl">
        <h2 className="font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
          커뮤니티 가이드
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground-700">
          모두가 따뜻하게 지낼 수 있도록, 몇 가지 약속을 함께 지켜요.
        </p>
      </div>

      <div className="mt-6 max-w-3xl space-y-2">
        {GUIDELINES.map((g, i) => {
          const open = openIndex === i;
          return (
            <div
              key={g.title}
              className="overflow-hidden rounded-lg border border-background-200 bg-background-50"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-background-100/60 cursor-pointer"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                  <i className={`${g.icon} text-base`} />
                </span>
                <span className="flex-1 font-heading text-sm font-bold text-foreground-950 md:text-base">
                  {g.title}
                </span>
                <i
                  className={`text-lg text-foreground-400 transition-transform ${
                    open ? 'ri-subtract-line' : 'ri-add-line'
                  }`}
                />
              </button>
              {open && (
                <div className="border-t border-background-100 px-4 py-4 pl-16">
                  <p className="text-sm leading-relaxed text-foreground-700">{g.desc}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}