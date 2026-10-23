import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useReactions } from '@/hooks/useReactions';
import { timeAgo } from '@/lib/format';

export type MyTab = 'written' | 'saved';

interface PostRow {
  id: string;
  title: string;
  created_at: string;
  view_count: number;
  board: { slug: string; name: string } | { slug: string; name: string }[] | null;
}

interface MyPostsSectionProps {
  userId: string;
  activeTab: MyTab;
  onTabChange: (tab: MyTab) => void;
}

const TAB_META: Record<MyTab, { label: string; icon: string; iconActive: string; empty: string; emptyIcon: string }> = {
  written: {
    label: '작성한 글',
    icon: 'ri-quill-pen-line',
    iconActive: 'ri-quill-pen-fill',
    empty: '아직 작성한 글이 없어요. 첫 글을 남겨보세요.',
    emptyIcon: 'ri-quill-pen-line',
  },
  saved: {
    label: '저장한 글',
    icon: 'ri-bookmark-line',
    iconActive: 'ri-bookmark-fill',
    empty: '아직 저장한 글이 없어요. 마음에 드는 글의 북마크를 눌러보세요.',
    emptyIcon: 'ri-bookmark-line',
  },
};

function boardOf(post: PostRow): { slug: string; name: string } | null {
  return Array.isArray(post.board) ? post.board[0] ?? null : post.board;
}

export default function MyPostsSection({ userId, activeTab, onTabChange }: MyPostsSectionProps) {
  const { bookmarkedIds } = useReactions();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(false);

      if (activeTab === 'saved') {
        const ids = bookmarkedIds;
        if (!ids.length) {
          if (active) {
            setPosts([]);
            setLoading(false);
          }
          return;
        }
        const { data, error: err } = await supabase
          .from('posts')
          .select('id, title, created_at, view_count, board:boards(slug, name)')
          .in('id', ids)
          .order('created_at', { ascending: false });
        if (!active) return;
        setPosts(err ? [] : ((data ?? []) as PostRow[]));
        setError(Boolean(err));
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from('posts')
        .select('id, title, created_at, view_count, board:boards(slug, name)')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });
      if (!active) return;
      setPosts(err ? [] : ((data ?? []) as PostRow[]));
      setError(Boolean(err));
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [activeTab, userId, bookmarkedIds]);

  const meta = TAB_META[activeTab];

  const tabs: MyTab[] = ['written', 'saved'];

  return (
    <section
      id="my-posts"
      className="scroll-mt-20 rounded-lg border border-background-200 bg-background-50 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-background-200 bg-background-100/60 p-1">
          {tabs.map((tab) => {
            const on = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                aria-pressed={on}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  on
                    ? 'bg-background-50 text-foreground-950 shadow-sm'
                    : 'text-foreground-500 hover:text-foreground-800'
                }`}
              >
                <i className={`${on ? TAB_META[tab].iconActive : TAB_META[tab].icon} text-base ${on ? 'text-accent-600' : ''}`} />
                {TAB_META[tab].label}
              </button>
            );
          })}
        </div>
        <span className="text-xs text-foreground-500">
          {posts.length}개
        </span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-background-100" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-lg bg-background-100/60 px-4 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <i className="ri-error-warning-line text-xl" />
          </span>
          <p className="text-sm text-foreground-600">목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
          <button
            type="button"
            onClick={() => onTabChange(activeTab)}
            className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg bg-background-100/60 px-4 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
            <i className={`${meta.emptyIcon} text-xl`} />
          </span>
          <p className="text-xs text-foreground-500">{meta.empty}</p>
          {activeTab === 'written' && (
            <Link
              to="/write"
              className="mt-1 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              글쓰기
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-background-100">
          {posts.map((p) => {
            const board = boardOf(p);
            const slug = board?.slug ?? 'food';
            return (
              <li key={p.id}>
                <Link
                  to={`/board/${slug}/${p.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:text-primary-700 cursor-pointer"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                    <i className={`${meta.iconActive} text-sm`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground-900">
                      {p.title}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-foreground-500">
                      <span>{board?.name ?? '게시판'}</span>
                      <span className="text-foreground-300">·</span>
                      <span>{timeAgo(p.created_at)}</span>
                      <span className="text-foreground-300">·</span>
                      <span className="flex items-center gap-1">
                        <i className="ri-eye-line text-xs" />
                        {p.view_count}
                      </span>
                    </span>
                  </span>
                  <i className="ri-arrow-right-s-line text-foreground-400" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}