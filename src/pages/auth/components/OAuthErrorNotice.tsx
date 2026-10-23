import type { OAuthDiagnosis } from '@/lib/oauthError';

interface OAuthErrorNoticeProps {
  diagnosis: OAuthDiagnosis;
  onClose: () => void;
}

export default function OAuthErrorNotice({ diagnosis, onClose }: OAuthErrorNoticeProps) {
  return (
    <div className="rounded-md border border-primary-200 bg-primary-50 p-4 text-xs text-primary-900">
      <div className="flex items-start gap-2">
        <i className="ri-error-warning-line mt-0.5 text-base text-primary-700" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-relaxed">{diagnosis.cause}</p>
          {diagnosis.steps.length > 0 && (
            <ul className="mt-2.5 space-y-1.5">
              {diagnosis.steps.map((step) => (
                <li key={step} className="flex items-start gap-2 leading-relaxed">
                  <i className="ri-arrow-right-s-line mt-0.5 text-sm text-primary-500" />
                  <span className="text-primary-800">{step}</span>
                </li>
              ))}
            </ul>
          )}
          {diagnosis.code && (
            <p className="mt-2.5 truncate border-t border-primary-200 pt-2 text-[10px] text-primary-600">
              진단 코드: {diagnosis.code}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="안내 닫기"
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary-600 transition-colors hover:bg-primary-100 hover:text-primary-800"
        >
          <i className="ri-close-line text-base" />
        </button>
      </div>
    </div>
  );
}