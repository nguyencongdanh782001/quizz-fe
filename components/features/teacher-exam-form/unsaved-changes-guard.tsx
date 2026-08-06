"use client";

import { useEffect, useRef } from "react";

interface UnsavedChangesGuardProps {
  enabled?: boolean;
  message: string;
  onNavigationRequest: (href: string) => void;
}

function isModifiedMouseEvent(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function findNavigationAnchor(
  target: EventTarget | null,
): HTMLAnchorElement | null {
  return target instanceof Element
    ? target.closest<HTMLAnchorElement>("a[href]")
    : null;
}

export function UnsavedChangesGuard({
  enabled = true,
  message,
  onNavigationRequest,
}: UnsavedChangesGuardProps) {
  const navigationRequestRef = useRef(onNavigationRequest);

  useEffect(() => {
    navigationRequestRef.current = onNavigationRequest;
  }, [onNavigationRequest]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = message;

      return message;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        isModifiedMouseEvent(event)
      ) {
        return;
      }

      const anchor = findNavigationAnchor(event.target);

      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        anchor.dataset.skipUnsavedGuard === "true" ||
        anchor.target === "_blank"
      ) {
        return;
      }

      const rawHref = anchor.getAttribute("href");

      if (!rawHref || rawHref.startsWith("#")) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);

      if (destination.origin !== window.location.origin) {
        return;
      }

      const currentUrl = new URL(window.location.href);

      if (
        destination.pathname === currentUrl.pathname &&
        destination.search === currentUrl.search &&
        destination.hash === currentUrl.hash
      ) {
        return;
      }

      /*
       * Chặn Link của Next.js trước khi router xử lý. Màn hình cha sẽ mở
       * modal xác nhận riêng thay vì gọi window.confirm().
       */
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      navigationRequestRef.current(
        `${destination.pathname}${destination.search}${destination.hash}`,
      );
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [enabled, message]);

  return null;
}
