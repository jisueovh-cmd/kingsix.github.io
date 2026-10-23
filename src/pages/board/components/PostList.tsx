import PostCard from '@/pages/board/components/PostCard';
import type { PostWithBoard } from '@/types/home';

interface PostListProps {
  posts: PostWithBoard[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-inbox-line text-2xl" />
        </span>
        <p className="mt-4 font-heading text-base font-semibold text-foreground-800">
          조건에 맞는 글이 없어요
        </p>
        <p className="mt-1 text-xs text-foreground-500">
          필터를 바꾸거나 첫 번째 이야기를 남겨보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}