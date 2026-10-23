import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, type AppNotification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { timeAgo } from '@/lib/format';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, loading, error, reload, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // 로그인 상태가 바뀌면 열려 있던 알림 패널을 닫아 최신 상태로 다시 열리게 한다.
  useEffect(() => {
    setOpen(false);
  }, [user?.id]);

  const openNotification = (n: AppNotification) => {
    markRead(n.id);
    setOpen(false);
    navigate(n.to);
  };

  const renderBody = () => {
    if (loading || authLoading) {
      return <p className="py-8 text-center text-sm text-foreground-500">알림을 불러오는 중...</p>;
    }
    if (error) {
      return (
        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <p className="text-sm text-foreground-600">알림을 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={reload}
            className="whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (!user) {
      return (
        <p className="px-6 py-8 text-center text-sm leading-relaxed text-foreground-500">
          로그인하면 내 글에 달린 댓글 알림을 볼 수 있어요.
        </p>
      );
    }
    if (items.length === 0) {
      return (
        <p className="px-6 py-8 text-center text-sm leading-relaxed text-foreground-500">
          아직 새 알림이 없어요.
          <br />
          내 글에 댓글이 달리면 여기에서 알려드릴게요.
        </p>
      );
    }

    return (
      <div className="max-h-[60vh] overflow-y-auto">
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => openNotification(n)}
            className={`flex w-full items-start gap-3 border-b border-background-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-background-100/60 cursor-pointer ${
              n.read ? 'opacity-70' : ''
            }`}
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <i className="ri-chat-3-line text-base" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-snug text-foreground-900">
                {n.title}
              </span>
              {n.body && (
                <span className="mt-0.5 block text-xs leading-relaxed text-foreground-600">
                  {n.body}
                </span>
              )}
              <span className="mt-1 block text-[11px] text-foreground-400">
                {timeAgo(n.createdAt)}
              </span>
            </span>
            {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
            <i className="ri-arrow-right-s-line mt-0.5 shrink-0 text-lg text-foreground-300" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="알림"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground-700 transition-colors hover:bg-background-100 hover:text-primary-700 cursor-pointer"
      >
        <i className="ri-notification-3-line text-xl" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-background-50">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-background-200 bg-background-50">
          <div className="flex items-center justify-between border-b border-background-200 bg-background-100/70 px-4 py-3">
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground-950">
              <i className="ri-notification-3-line text-accent-600" />
              알림
              {unread > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  {unread}
                </span>
              )}
            </h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="whitespace-nowrap text-xs font-medium text-primary-700 transition-colors hover:text-primary-800 cursor-pointer"
              >
                모두 읽음
              </button>
            )}
          </div>

          {renderBody()}
        </div>
      )}
    </div>
  );
}