'use client';

import * as React from 'react';

interface OTPInputProps {
  value: string;       // always 4 chars
  onChange: (val: string) => void;
  error?: string;
}

export function OTPInput({ value, onChange, error }: OTPInputProps) {
  const [focusedIdx, setFocusedIdx] = React.useState(0);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const chars = value.split('').concat(Array(4 - value.length).fill(''));

  const setChar = (idx: number, ch: string) => {
    if (ch.length > 1) {
      // paste: fill all boxes with first 4 chars
      const trimmed = ch.slice(0, 4);
      onChange(trimmed);
      const next = Math.min(trimmed.length, 3);
      setFocusedIdx(next);
      inputRefs.current[next]?.focus();
      return;
    }
    if (!/^.$/.test(ch) && ch !== '') return; // ignore multi-char except paste
    const next = (value.slice(0, idx) + ch + value.slice(idx + 1)).slice(0, 4);
    onChange(next);
    if (next.length < 4 && idx < 3) {
      setFocusedIdx(idx + 1);
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (chars[idx]) {
        const next = value.slice(0, idx) + value.slice(idx + 1);
        onChange(next);
      } else if (idx > 0) {
        setFocusedIdx(idx - 1);
        inputRefs.current[idx - 1]?.focus();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      setFocusedIdx(idx - 1);
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && idx < 3) {
      setFocusedIdx(idx + 1);
      inputRefs.current[idx + 1]?.focus();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2" aria-label="OTP input">
        {chars.map((ch, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="text"
            maxLength={4}
            value={ch}
            onChange={e => setChar(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onFocus={() => setFocusedIdx(i)}
            className={
              'w-12 h-12 text-center text-xl font-bold rounded-xl border text-on-surface ' +
              'outline-none transition-all ' +
              (focusedIdx === i
                ? 'border-primary ring-2 ring-primary/30 bg-surface'
                : 'border-outline/30 bg-surface hover:border-outline/50') +
              (error ? ' border-destructive' : '')
            }
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">Nhập đáp án đúng (tối đa 4 ký tự)</p>
    </div>
  );
}