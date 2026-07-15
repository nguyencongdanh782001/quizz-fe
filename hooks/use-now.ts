"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current Date, refreshed every `intervalMs` (default 60s).
 *
 * Use this when a component needs a live-ticking view of "now" without
 * pulling in a heavier timer / observer. Cheap re-render at 1×/min.
 *
 * The first render returns the Date at mount time.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
