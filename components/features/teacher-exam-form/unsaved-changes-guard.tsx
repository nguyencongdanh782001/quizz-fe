"use client";

import { useFormikContext } from "formik";
import { useEffect } from "react";
import type { TeacherExamFormValues } from "./types";

function isModifiedClickEvent(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

export function UnsavedChangesGuard({
  enabled = true,
  message,
}: {
  enabled?: boolean;
  message: string;
}) {
  const { dirty, isSubmitting } = useFormikContext<TeacherExamFormValues>();
  const shouldBlockNavigation = enabled && dirty && !isSubmitting;

  useEffect(() => {
    if (!shouldBlockNavigation) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = message;
      return message;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedClickEvent(event)) {
        return;
      }

      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        anchor.dataset.skipUnsavedWarning === "true" ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(anchor.href, window.location.href);
      const isSameDestination =
        nextUrl.origin === currentUrl.origin &&
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search &&
        nextUrl.hash === currentUrl.hash;

      if (isSameDestination) {
        return;
      }

      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [message, shouldBlockNavigation]);

  return null;
}
