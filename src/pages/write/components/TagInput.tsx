import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  max?: number;
}

export default function TagInput({ tags, onChange, max = 8 }: TagInputProps) {
  const [input, setInput] = useState('');

  const commit = (raw: string) => {
    const value = raw.trim().replace(/^#/, '').replace(/\s+/g, '');
    if (!value) return;
    if (tags.length >= max) return;
    if (tags.includes(value)) {
      setInput('');
      return;
    }
    onChange([...tags, value]);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      commit(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-background-300 bg-background-50 px-3 py-2 focus-within:border-primary-400">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2.5 py-1 text-xs text-secondary-900"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              aria-label={`${tag} 삭제`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-secondary-900/70 transition-colors hover:bg-secondary-200 cursor-pointer"
            >
              <i className="ri-close-line text-sm" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(input)}
          maxLength={20}
          placeholder={tags.length === 0 ? '예) 캠핑, 홈카페 (Enter로 추가)' : ''}
          className="min-w-[140px] flex-1 bg-transparent text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none"
        />
      </div>
      <p className="mt-1 text-xs text-foreground-500">
        최대 {max}개까지 · Enter나 쉼표로 추가돼요
      </p>
    </div>
  );
}