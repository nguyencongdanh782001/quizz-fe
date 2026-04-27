'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

export interface TimerState {
  timeLeft: number; // seconds remaining
  isRunning: boolean;
  isExpired: boolean;
}

export function useExamTimer(
  initialSeconds: number,
  onExpire?: () => void
): TimerState {
  const [endTime] = useState<number | null>(() =>
    initialSeconds > 0 ? Date.now() + initialSeconds * 1000 : null,
  );
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(initialSeconds > 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleExpire = useEffectEvent(() => {
    onExpire?.();
  });

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Recalculate timeLeft from endTime on every tick (drift-free)
    const tick = () => {
      if (!endTime) return;
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setIsRunning(false);
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        handleExpire();
      }
    };

    intervalRef.current = setInterval(tick, 250); // check every 250ms for accuracy
    tick(); // immediate first check

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [endTime, isRunning]);

  return {
    timeLeft,
    isRunning,
    isExpired: timeLeft === 0,
  };
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
