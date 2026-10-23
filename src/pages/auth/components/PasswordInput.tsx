import { useState } from 'react';

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  showStrength?: boolean;
}

interface Strength {
  score: number;
  label: string;
  color: string;
  text: string;
}

function calcStrength(password: string): Strength {
  if (!password) return { score: 0, label: '', color: '', text: '' };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { score, label: '약해요', color: 'bg-primary-500', text: 'text-primary-600' };
  }
  if (score === 2) {
    return { score, label: '보통이에요', color: 'bg-accent-500', text: 'text-accent-600' };
  }
  if (score === 3) {
    return { score, label: '좋아요', color: 'bg-accent-500', text: 'text-accent-700' };
  }
  return { score, label: '아주 좋아요', color: 'bg-accent-600', text: 'text-accent-700' };
}

export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  showStrength = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? calcStrength(value) : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-foreground-800">
          {label}
        </label>
        {strength && value.length > 0 && (
          <span className={`text-xs ${strength.text}`}>{strength.label}</span>
        )}
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 pr-10 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
          className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center text-foreground-400 transition-colors hover:text-foreground-600"
        >
          <i className={visible ? 'ri-eye-off-line' : 'ri-eye-line'} />
        </button>
      </div>
      {strength && value.length > 0 && (
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= strength.score ? strength.color : 'bg-background-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}