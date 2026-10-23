import { useEffect, useRef, useState } from 'react';
import type { SmallTalkMessage } from '@/types/home';
import { timeAgo } from '@/lib/format';

interface PeopleChatProps {
  messages: SmallTalkMessage[];
  onSend: (nickname: string, content: string) => Promise<boolean>;
}

export default function PeopleChat({ messages, onSend }: PeopleChatProps) {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(nickname, trimmed);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '메시지를 보내지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="py-12 text-center text-xs text-foreground-500">
            아직 잡담이 없어요. 첫 마디를 남겨보세요!
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-chat-smile-2-line text-base" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-foreground-800">{msg.nickname}</span>
                <span className="text-[10px] text-foreground-400">{timeAgo(msg.created_at)}</span>
              </div>
              <p className="mt-0.5 break-words rounded-lg rounded-tl-none bg-background-100 px-3 py-2 text-sm leading-relaxed text-foreground-800">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-background-200 bg-background-50 px-3 pt-2.5 pb-3">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          placeholder="닉네임 (선택)"
          className="mb-2 w-full rounded-full border border-background-200 bg-background-50 px-3.5 py-2 text-sm text-foreground-900 outline-none placeholder:text-foreground-400 focus:border-accent-400"
        />
        <div className="flex items-center gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            maxLength={300}
            placeholder="메시지 입력..."
            className="w-full rounded-full border border-background-200 bg-background-50 px-4 py-2.5 text-sm text-foreground-900 outline-none placeholder:text-foreground-400 focus:border-accent-400"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500 text-accent-50 transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            aria-label="전송"
          >
            <i className={sending ? 'ri-loader-4-line animate-spin' : 'ri-send-plane-fill'} />
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-primary-700">{error}</p>}
      </div>
    </div>
  );
}