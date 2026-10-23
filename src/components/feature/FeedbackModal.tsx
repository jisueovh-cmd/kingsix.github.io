import { useState, type FormEvent } from 'react';

const SUBMIT_ADDR = 'https://readdy.ai/api/form/danug2l1d38lmdrdb20g';

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const honeypot = String(formData.get('company_alt') ?? '').trim();
    if (honeypot) {
      // 봇으로 간주: 실제 전송은 하지 않고 일반 성공 화면과 동일하게 처리
      setStatus('success');
      form.reset();
      return;
    }
    formData.delete('company_alt');

    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      params.append(key, String(value));
    });

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(SUBMIT_ADDR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const responseText = await res.text();
      let parsed: { code?: string; meta?: { message?: string; detail?: string }; message?: string } | null = null;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = null;
      }
      const serverMsg =
        parsed?.meta?.message || parsed?.message || parsed?.meta?.detail || responseText;
      const isSpam = /spam/i.test(serverMsg);
      const ok = res.ok && parsed?.code === 'OK';

      if (ok && !isSpam) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
        setError(isSpam ? '전송을 완료하지 못했어요. 다시 시도해주세요.' : serverMsg || '전송에 실패했어요.');
      }
    } catch {
      setStatus('error');
      setError('네트워크 오류로 전송하지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground-950/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-background-200 bg-background-50 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground-950">의견 보내기</h3>
            <p className="mt-1 text-xs text-foreground-500">
              자파리를 더 좋게 만들 의견을 들려주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-500 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-lg bg-accent-50 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-checkbox-circle-line text-2xl" />
            </span>
            <p className="mt-3 font-heading text-base font-bold text-foreground-950">
              소중한 의견 감사해요
            </p>
            <p className="mt-1 text-xs text-foreground-600">잘 전달됐어요. 자파리가 더 좋아질게요.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} data-readdy-form className="mt-5 space-y-4" noValidate>
            {/* 봇 차단용 보조 필드 (사용자에게는 보이지 않음) */}
            <input
              type="text"
              name="company_alt"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              readOnly
              className="contact-alt-field"
            />

            <div>
              <label htmlFor="fb-type" className="block text-sm font-medium text-foreground-800">
                유형
              </label>
              <select
                id="fb-type"
                name="type"
                className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
              >
                <option value="의견">의견</option>
                <option value="건의">건의</option>
                <option value="버그">버그 신고</option>
                <option value="칭찬">칭찬</option>
              </select>
            </div>

            <div>
              <label htmlFor="fb-email" className="block text-sm font-medium text-foreground-800">
                이메일 <span className="text-foreground-400">(선택)</span>
              </label>
              <input
                id="fb-email"
                name="email"
                type="email"
                placeholder="답변 받을 이메일"
                className="mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
              />
            </div>

            <div>
              <label htmlFor="fb-message" className="block text-sm font-medium text-foreground-800">
                내용
              </label>
              <textarea
                id="fb-message"
                name="message"
                required
                maxLength={500}
                rows={5}
                placeholder="하고 싶은 말을 자유롭게 적어주세요."
                className="mt-1.5 w-full resize-none rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
              />
              <p className="mt-1 text-right text-[11px] text-foreground-400">최대 500자</p>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
                <i className="ri-error-warning-line text-base" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line" />
                    보내기
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}