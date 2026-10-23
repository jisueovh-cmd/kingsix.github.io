import { Link } from 'react-router-dom';
import { mockPhotos } from '@/mocks/content';

export default function PhotoGallery() {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-label uppercase tracking-[0.2em] text-primary-600">
            MOMENTS
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">
            이번 주의 순간들
          </h2>
        </div>
        <Link
          to="/explore?type=photo"
          className="hidden items-center gap-1 whitespace-nowrap text-sm text-foreground-600 transition-colors hover:text-primary-700 sm:flex cursor-pointer"
        >
          사진 더 보기
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {mockPhotos.map((photo) => (
          <Link
            key={photo.id}
            to="/explore?type=photo"
            className="group relative block overflow-hidden rounded-lg bg-background-100 cursor-pointer"
          >
            <div className="h-[180px] w-full overflow-hidden md:h-[220px]">
              <img
                src={photo.src}
                alt={photo.title}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="line-clamp-1 text-xs font-medium text-background-50">{photo.title}</p>
              <p className="text-[10px] text-background-100/80">{photo.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}