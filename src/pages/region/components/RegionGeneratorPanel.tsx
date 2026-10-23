import { useState } from 'react';
import {
  REGION_CATEGORIES,
  REGION_TONE_CLASSES,
  REGION_MAX_COUNT,
  REGION_MIN_COUNT,
  type RegionHubConfig,
} from '@/lib/region';
import type { RegionGenerateArea, RegionGenerateCategory, RegionGenerateResult } from '@/hooks/useRegionInfo';

interface RegionGeneratorPanelProps {
  hub: RegionHubConfig;
  loggedIn: boolean;
  onGenerate: (
    category: RegionGenerateCategory,
    area: RegionGenerateArea,
    count: number,
  ) => Promise<RegionGenerateResult>;
  onRequireLogin: () => void;
}

const COUNT_OPTIONS = [5, 10, 20, 50];

export default function RegionGeneratorPanel({
  hub,
  loggedIn,
  onGenerate,
  onRequireLogin,
}: RegionGeneratorPanelProps) {
  const [category, setCategory] = useState<RegionGenerateCategory>('all');
  const [area, setArea] = useState<RegionGenerateArea>('all');
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'warn' | 'error'; text: string } | null>(
    null,
  );

  const handleGenerate = async () => {
    if (!loggedIn) {
      onRequireLogin();
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await onGenerate(category, area, count);
    setBusy(false);
    if (result.notConfigured) {
      setMessage({ tone: 'warn', text: hub.generator.notConfigured });
    } else if (result.error) {
      setMessage({ tone: 'error', text: result.error });
    } else {
      setMessage({ tone: 'ok', text: hub.generator.success(result.inserted) });
    }
  };

  const categoryLabel =
    category === 'all'
      ? '전체 분야'
      : (REGION_CATEGORIES.find((c) => c.key === category)?.label ?? '전체 분야');
  const areaLabel =
    area === 'all'
      ? hub.scopeAllLabel
      : (hub.groups.find((g) => g.key === area)?.label ?? hub.scopeAllLabel);

  return (
    <section
      id="region-generator"
      className="scroll-mt-24 overflow-hidden rounded-lg border border-accent-200 bg-accent-50/60"
    >
      <div className="border-b border-accent-200/70 px-5 py-5 md:px-7 md:py-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-background-50">
            <i className="ri-robot-2-line text-2xl" />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-bold text-foreground-950 md:text-xl">
              {hub.generator.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-foreground-600 md:text-sm">
              {hub.generator.description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 md:px-7 md:py-6">
        <p className="text-xs font-label uppercase tracking-[0.18em] text-foreground-500">지역</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setArea('all')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              area === 'all'
                ? 'border-accent-500 bg-accent-500 text-background-50'
                : 'border-accent-200 bg-background-50 text-accent-800 hover:border-accent-300'
            }`}
          >
            <i className="ri-earth-line text-base" />
            {hub.scopeAllLabel}
          </button>
          {hub.groups.map((group) => {
            const active = group.key === area;
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => setArea(group.key)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'border-accent-500 bg-accent-500 text-background-50'
                    : 'border-accent-200 bg-background-50 text-accent-800 hover:border-accent-300'
                }`}
              >
                <i className={`${group.icon} text-base`} />
                {group.label}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs font-label uppercase tracking-[0.18em] text-foreground-500">
          정보 분야
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              category === 'all'
                ? 'border-accent-500 bg-accent-500 text-background-50'
                : 'border-accent-200 bg-background-50 text-accent-800 hover:border-accent-300'
            }`}
          >
            <i className="ri-shuffle-line text-base" />
            전체 분야 골고루
          </button>
          {REGION_CATEGORIES.map((cat) => {
            const tone = REGION_TONE_CLASSES[cat.tone];
            const active = cat.key === category;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  active ? tone.chipActive : tone.chip
                }`}
              >
                <i className={`${cat.icon} text-base`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-label uppercase tracking-[0.18em] text-foreground-500">
              한 번에 모을 개수
            </p>
            <div className="mt-3 inline-flex flex-wrap rounded-full border border-accent-200 bg-background-50 p-1">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    n === count
                      ? 'bg-accent-500 text-background-50'
                      : 'text-foreground-600 hover:text-accent-700'
                  }`}
                >
                  {n}개
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-foreground-500">
              많이 고를수록 게시판이 한 번에 채워져요 ({REGION_MIN_COUNT}~{REGION_MAX_COUNT}개)
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto cursor-pointer"
          >
            {busy ? (
              <>
                <i className="ri-loader-4-line animate-spin text-lg" />
                AI가 정보 모으는 중...
              </>
            ) : (
              <>
                <i className="ri-sparkling-2-line text-lg" />
                {loggedIn
                  ? `AI가 ${areaLabel} ${categoryLabel} ${count}개 모으기`
                  : '로그인하고 AI 정보 모으기'}
              </>
            )}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-xs md:text-sm ${
              message.tone === 'ok'
                ? 'border-primary-200 bg-primary-50 text-primary-800'
                : message.tone === 'warn'
                  ? 'border-secondary-200 bg-secondary-50 text-secondary-900'
                  : 'border-primary-300 bg-primary-100/70 text-primary-900'
            }`}
          >
            <i
              className={`mt-0.5 text-base ${
                message.tone === 'ok'
                  ? 'ri-checkbox-circle-line'
                  : message.tone === 'warn'
                    ? 'ri-information-line'
                    : 'ri-error-warning-line'
              }`}
            />
            <span>{message.text}</span>
          </div>
        )}

        <p className="mt-4 flex items-center gap-1.5 text-xs text-foreground-500">
          <i className="ri-shield-check-line" />
          {hub.generator.tip}
        </p>
      </div>
    </section>
  );
}