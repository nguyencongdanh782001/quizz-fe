"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { api as analyticsApi } from "@/lib/api/endpoints/analytics";
import type {
  TrackHeartbeatRequest,
  TrackPageViewRequest,
} from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

const VISITOR_ID_KEY = "analytics-visitor-id";
const SESSION_ID_KEY = "analytics-session-id";
const HEARTBEAT_INTERVAL_MS = 30_000;

let fallbackVisitorId: string | null = null;
let fallbackSessionId: string | null = null;

type AnalyticsBasePayload = Omit<TrackHeartbeatRequest, "user_id"> & {
  user_id: number | null;
};

function createAnalyticsId(prefix: string) {
  const randomId =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${randomId}`.slice(0, 128);
}

function getStoredAnalyticsId(
  storage: Storage,
  key: string,
  prefix: string,
) {
  const existingId = storage.getItem(key);

  if (existingId) {
    return existingId.slice(0, 128);
  }

  const nextId = createAnalyticsId(prefix);
  storage.setItem(key, nextId);
  return nextId;
}

function getVisitorId() {
  try {
    return getStoredAnalyticsId(localStorage, VISITOR_ID_KEY, "v");
  } catch {
    fallbackVisitorId ??= createAnalyticsId("v");
    return fallbackVisitorId;
  }
}

function getSessionId() {
  try {
    return getStoredAnalyticsId(sessionStorage, SESSION_ID_KEY, "s");
  } catch {
    fallbackSessionId ??= createAnalyticsId("s");
    return fallbackSessionId;
  }
}

function nullableText(value: string | null | undefined, maxLength: number) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue.slice(0, maxLength) : null;
}

function getCurrentPath() {
  const path = `${window.location.pathname}${window.location.search}`;
  return (path || "/").slice(0, 2048);
}

function buildAnalyticsPayload(userId: number | null): AnalyticsBasePayload {
  return {
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    path: getCurrentPath(),
    title: nullableText(document.title, 512),
    origin: nullableText(window.location.origin, 512),
    screen_width: window.screen?.width ?? null,
    screen_height: window.screen?.height ?? null,
    user_id: userId,
  };
}

function sendPageView(userId: number | null) {
  const payload: TrackPageViewRequest = {
    ...buildAnalyticsPayload(userId),
    referrer: nullableText(document.referrer, 2048),
  };

  void analyticsApi.analytics.pageView(payload).catch(() => undefined);
}

function sendHeartbeat(userId: number | null) {
  if (document.visibilityState !== "visible") {
    return;
  }

  void analyticsApi.analytics
    .heartbeat(buildAnalyticsPayload(userId))
    .catch(() => undefined);
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const userIdRef = useRef<number | null>(userId);
  const lastPageViewKeyRef = useRef<string | null>(null);
  const searchString = searchParams.toString();

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const pageViewKey = `${pathname}?${searchString}`;

    if (lastPageViewKeyRef.current === pageViewKey) {
      return;
    }

    lastPageViewKeyRef.current = pageViewKey;
    sendPageView(userIdRef.current);
    sendHeartbeat(userIdRef.current);
  }, [pathname, searchString]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startHeartbeat = () => {
      if (intervalId) {
        return;
      }

      intervalId = setInterval(() => {
        sendHeartbeat(userIdRef.current);
      }, HEARTBEAT_INTERVAL_MS);
    };

    const stopHeartbeat = () => {
      if (!intervalId) {
        return;
      }

      clearInterval(intervalId);
      intervalId = null;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat(userIdRef.current);
        startHeartbeat();
        return;
      }

      stopHeartbeat();
    };

    if (document.visibilityState === "visible") {
      startHeartbeat();
    }

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopHeartbeat();
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
