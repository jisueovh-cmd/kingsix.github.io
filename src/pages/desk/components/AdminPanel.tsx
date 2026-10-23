import { useState } from 'react';
import { OWNER_EMAILS } from '@/lib/owner';
import { useSiteAdmins } from '@/hooks/useSiteAdmins';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function AdminPanel() {
  const { admins, loading, error, reload, addAdmin, removeAdmin } = useSiteAdmins(true);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  const handleAdd = async () => {
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setMessage({ type: 'err', text: '올바른 이메일 주소를 입력해주세요.' });
      return;
    }
    if (OWNER_EMAILS.some((item) => item.trim().toLowerCase() === value)) {
      setMessage({ type: 'err', text: '이미 기본 관리자로 지정된 이메일이에요.' });
      return;
    }
    if (admins.some((item) => item.email.toLowerCase() === value)) {
      setMessage({ type: 'err', text: '이미 관리자로 지정된 이메일이에요.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    const err = await addAdmin(value);
    if (err) {
      setMessage({ type: 'err', text: `추가하지 못했어요: ${err}` });
    } else {
      setMessage({ type: 'ok', text: `${value} 님을 관리자로 추가했어요.` });
      setEmail('');
    }
    setBusy(false);
  };

  const handleRemove = async (target: string) => {
    setBusy(true);
    setMessage(null);
    const err = await removeAdmin(target);
    if (err) {
      setMessage({ type: 'err', text: `삭제하지 못했어요: ${err}` });
    } else {
      setMessage({ type: 'ok', text: `${target} 님을 관리자에서 제외했어요.` });
    }
    setConfirmEmail(null);
    setBusy(false);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-primary-200 bg-primary-50/60 px-5 py-4">
        <p className="flex items-center gap-2 font-heading text-sm font-bold text-primary-800">
          <i className="ri-shield-star-line text-base" />
          관리자 지정
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground-600">
          이메일을 입력하면 그 계정을 관리자로 올릴 수 있어요. 관리자는 <strong>/desk</strong> 관리
          데스크 전체와 실시간 접속자·방문 통계를 볼 수 있어요. 추가·삭제는 <strong>관리자만</strong>{' '}
          할 수 있고, 기본 관리자는 제외할 수 없어요.
        </p>
      </div>

      {/* 기본(고정) 관리자 */}
      <div className="rounded-lg border border-background-200 bg-background-50">
        <div className="border-b border-background-200 px-5 py-3.5">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground-900">
            <i className="ri-lock-2-line text-accent-600" />
            기본 관리자
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">항상 관리자이며 제외할 수 없어요.</p>
        </div>
        <ul className="divide-y divide-background-200">
          {OWNER_EMAILS.map((item) => (
            <li key={item} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                  <i className="ri-vip-crown-line text-sm" />
                </span>
                <span className="truncate text-sm font-medium text-foreground-900">{item}</span>
              </span>
              <span className="shrink-0 rounded-full bg-primary-100 px-2.5 py-0.5 text-[11px] font-medium text-primary-800">
                고정
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 추가 관리자 추가 */}
      <div className="rounded-lg border border-background-200 bg-background-50 p-5">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground-900">
          <i className="ri-user-add-line text-accent-600" />
          관리자 추가
        </h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder="example@email.com"
            autoComplete="off"
            className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy || !email.trim()}
            className="flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            <i className={busy ? 'ri-loader-4-line animate-spin' : 'ri-add-line'} />
            관리자로 추가
          </button>
        </div>
        <p className="mt-2 text-xs text-foreground-500">
          그 이메일로 가입한 계정이 있으면 바로 적용되고, 없으면 나중에 그 이메일로 가입할 때 자동으로
          관리자가 돼요.
        </p>
        {message && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-md border px-3 py-2.5 text-xs ${
              message.type === 'ok'
                ? 'border-accent-200 bg-accent-50 text-accent-800'
                : 'border-primary-200 bg-primary-50 text-primary-800'
            }`}
          >
            <i
              className={
                message.type === 'ok' ? 'ri-checkbox-circle-line text-base' : 'ri-error-warning-line text-base'
              }
            />
            {message.text}
          </div>
        )}
      </div>

      {/* 추가된 관리자 목록 */}
      <div className="rounded-lg border border-background-200 bg-background-50">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-background-200 px-5 py-3.5">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground-900">
            <i className="ri-team-line text-accent-600" />
            추가 관리자
          </h2>
          <button
            type="button"
            onClick={reload}
            className="flex items-center gap-1 rounded-md border border-background-300 px-3 py-1.5 text-xs font-medium text-foreground-700 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-refresh-line" />
            새로고침
          </button>
        </div>

        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-foreground-500">불러오는 중...</p>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
            <p className="text-sm text-foreground-600">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        ) : admins.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-foreground-500">
            아직 추가된 관리자가 없어요. 위에서 이메일을 입력해 추가해보세요.
          </p>
        ) : (
          <ul className="divide-y divide-background-200">
            {admins.map((item) => (
              <li key={item.email} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
                    <i className="ri-user-line text-sm" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground-900">{item.email}</p>
                    <p className="text-xs text-foreground-500">{formatDate(item.created_at)} 추가</p>
                  </div>
                </div>
                {confirmEmail === item.email ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground-600">정말 제외할까요?</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.email)}
                      disabled={busy}
                      className="whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:opacity-60 cursor-pointer"
                    >
                      제외
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmEmail(null)}
                      className="whitespace-nowrap rounded-md border border-background-300 px-3 py-1.5 text-xs font-medium text-foreground-700 transition-colors hover:bg-background-100 cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmEmail(item.email)}
                    className="flex items-center gap-1 whitespace-nowrap rounded-md border border-background-300 px-3 py-1.5 text-xs font-medium text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-700 cursor-pointer"
                  >
                    <i className="ri-user-unfollow-line" />
                    관리자 제외
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}