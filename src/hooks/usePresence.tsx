import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getGuestKey } from '@/lib/viewStore';
import { useAuth } from '@/hooks/useAuth';

const CHANNEL_NAME = 'site-online';

export interface OnlineVisitor {
  key: string;
  nickname: string;
  loggedIn: boolean;
  joinedAt: string;
}

interface PresenceContextValue {
  count: number | null;
  visitors: OnlineVisitor[];
}

const PresenceContext = createContext<PresenceContextValue | undefined>(undefined);

interface PresenceMeta {
  nickname?: unknown;
  loggedIn?: unknown;
  joinedAt?: unknown;
}

// Supabase 실시간 Presence를 앱 전체에서 하나의 연결로 공유한다.
// - 접속자 수(푸터)와 접속자 목록(관리창)이 같은 채널을 함께 사용한다.
// - 브라우저별 방문자 키를 presence 키로 써서, 탭을 여러 개 열어도 1명으로 센다.
// - 로그인한 사람은 닉네임을 함께 실어 보내고, 비로그인은 '익명'으로 표시된다.
export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [visitors, setVisitors] = useState<OnlineVisitor[]>([]);
  const [count, setCount] = useState<number | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const subscribedRef = useRef(false);
  const joinedAtRef = useRef(new Date().toISOString());

  const nickname = profile?.nickname || profile?.username || '';
  const loggedIn = Boolean(user);

  const sync = useCallback(() => {
    const channel = channelRef.current;
    if (!channel) return;
    const state = channel.presenceState() as unknown as Record<string, PresenceMeta[]>;
    const list: OnlineVisitor[] = Object.entries(state).map(([key, metas]) => {
      const meta = metas[0] ?? {};
      return {
        key,
        nickname: typeof meta.nickname === 'string' ? meta.nickname : '',
        loggedIn: Boolean(meta.loggedIn),
        joinedAt: typeof meta.joinedAt === 'string' ? meta.joinedAt : joinedAtRef.current,
      };
    });
    setVisitors(list);
    setCount(list.length);
  }, []);

  // 닉네임·로그인 여부는 최신 값을 track에 쓰기 위해 ref에도 보관한다.
  const trackInfoRef = useRef({ nickname: '', loggedIn: false });
  useEffect(() => {
    trackInfoRef.current = { nickname, loggedIn };
    const channel = channelRef.current;
    if (channel && subscribedRef.current) {
      void channel.track({
        nickname,
        loggedIn,
        joinedAt: joinedAtRef.current,
      });
    }
  }, [nickname, loggedIn]);

  useEffect(() => {
    const guestKey = getGuestKey();
    const channel = supabase.channel(
      CHANNEL_NAME,
      guestKey ? { config: { presence: { key: guestKey } } } : undefined,
    );
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          subscribedRef.current = true;
          void channel.track({
            nickname: trackInfoRef.current.nickname,
            loggedIn: trackInfoRef.current.loggedIn,
            joinedAt: joinedAtRef.current,
          });
        }
      });

    return () => {
      subscribedRef.current = false;
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [sync]);

  const value = useMemo<PresenceContextValue>(() => ({ count, visitors }), [count, visitors]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

// 푸터용: 지금 접속 중인 사람 수만 필요할 때.
export function useOnlineCount(): number | null {
  const ctx = useContext(PresenceContext);
  return ctx ? ctx.count : null;
}

// 관리창용: 지금 접속 중인 사람 목록 전체가 필요할 때.
export function useOnlineVisitors(): OnlineVisitor[] {
  const ctx = useContext(PresenceContext);
  return ctx ? ctx.visitors : [];
}