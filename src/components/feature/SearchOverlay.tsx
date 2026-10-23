import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { NAV_BOARDS } from '@/lib/nav';

interface SearchOverlayProps {
  onClose: () => void;
}

interface PostResult {
  id: string;
  title: string;
  board: { slug: string; name: string } | { slug: string; name: string }[] | null;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 1) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, board:boards(slug, name)')
          .ilike('title', `%${term}%`)
          .order('created_at', { ascending: false })
          .limit(8);
        if (!active) return;
        if (error) throw error;
        setResults((data ?? []) as PostResult[]);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const matchedBoards = query.trim()
    ? NAV_BOARDS.filter((b) => b.name.includes(query.trim()))
    : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-foreground-950/40 px-4 pt-24 backdrop-blur-sm">
      <button
        type="button"
        aria-label="검색 닫기"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-background-200 bg-background-50">
        <div className="flex items-center gap-2 border-b border-background-200 px-4 py-3">
          <i className="ri-search-line text-xl text-foreground-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="궁금한 글 제목이나 게시판을 검색해보세요"
            className="w-full bg-transparent text-sm text-foreground-950 outline-none placeholder:text-foreground-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-500 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query.trim() && (
            <p className="px-3 py-6 text-center text-sm text-foreground-500">
              검색어를 입력하면 글과 게시판을 찾아드려요.
            </p>
          )}

          {matchedBoards.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-1.5 text-xs font-label uppercase tracking-wide text-foreground-500">
                게시판
              </p>
              {matchedBoards.map((b) => (
                <Link
                  key={b.slug}
                  to={`/board/${b.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
                >
                  <i className="ri-layout-grid-line text-accent-600" />
                  {b.name}
                </Link>
              ))}
            </div>
          )}

          {query.trim() && (
            <div>
              <p className="px-3 py-1.5 text-xs font-label uppercase tracking-wide text-foreground-500">
                글
              </p>
              {searching && (
                <p className="px-3 py-4 text-sm text-foreground-500">검색 중...</p>
              )}
              {!searching && results.length === 0 && (
                <p className="px-3 py-4 text-sm text-foreground-500">검색 결과가 없어요.</p>
              )}
              {results.map((post) => {
                const board = Array.isArray(post.board) ? post.board[0] : post.board;
                const slug = board?.slug ?? 'food';
                return (
                  <Link
                    key={post.id}
                    to={`/board/${slug}/${post.id}`}
                    onClick={onClose}
                    className="flex flex-col gap-0.5 rounded-md px-3 py-2.5 transition-colors hover:bg-background-100 cursor-pointer"
                  >
                    <span className="text-sm text-foreground-900 line-clamp-1">{post.title}</span>
                    <span className="text-xs text-foreground-500">{board?.name ?? '게시판'}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}