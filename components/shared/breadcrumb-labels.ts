"use client";

import { useEffect, useSyncExternalStore } from "react";

const breadcrumbLabelOverrides = new Map<string, string>();
const listeners = new Set<() => void>();
let storeVersion = 0;

function emitChange() {
  storeVersion += 1;

  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return storeVersion;
}

export const BREADCRUMB_LOADING_LABEL = "...";

export function useBreadcrumbLabelStoreVersion() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getBreadcrumbLabelOverride(href: string): string | undefined {
  return breadcrumbLabelOverrides.get(href);
}

export function setBreadcrumbLabelOverride(href: string, label: string) {
  const nextLabel = label.trim();

  if (!nextLabel) {
    clearBreadcrumbLabelOverride(href);
    return;
  }

  if (breadcrumbLabelOverrides.get(href) === nextLabel) {
    return;
  }

  breadcrumbLabelOverrides.set(href, nextLabel);
  emitChange();
}

export function clearBreadcrumbLabelOverride(href: string) {
  if (!breadcrumbLabelOverrides.has(href)) {
    return;
  }

  breadcrumbLabelOverrides.delete(href);
  emitChange();
}

export function useBreadcrumbLabel(
  href: string,
  label: string | null | undefined,
) {
  useEffect(() => {
    const nextLabel = label?.trim();

    if (!nextLabel) {
      clearBreadcrumbLabelOverride(href);
      return;
    }

    setBreadcrumbLabelOverride(href, nextLabel);

    return () => {
      clearBreadcrumbLabelOverride(href);
    };
  }, [href, label]);
}

export function isDynamicBreadcrumbSegment(segment: string) {
  return /^\d+$/.test(segment);
}
