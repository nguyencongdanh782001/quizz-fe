"use client";

import { useMemo } from "react";
import createDOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { renderMathToHtml } from "@/lib/math-render";

const RICH_TEXT_CONTENT_CLASS =
  "text-sm leading-6 text-[#1E293B] " +
  "[&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic " +
  "[&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:text-base [&_h4]:font-semibold " +
  "[&_img]:max-w-full [&_img]:rounded [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-white " +
  "[&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_.math-formula]:inline-block [&_.math-formula]:align-middle [&_.math-formula]:text-inherit [&_.math-formula_.katex]:text-inherit";

const FALLBACK_TEXT_BY_TAG: Record<string, string> = {
  br: "\n",
  div: "\n",
  p: "\n",
  li: "\n",
  tr: "\n",
};

interface RichTextRendererProps {
  html?: string | null;
  fallback?: string;
  className?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasHtmlTag(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

function normalizeInputHtml(value: string): string {
  if (hasHtmlTag(value)) {
    return value;
  }

  return escapeHtml(value).replace(/\n/g, "<br />");
}

function sanitizeHtml(value: string): string {
  if (typeof window === "undefined") {
    return value
      .replace(
        /<(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi,
        "",
      )
      .replace(/<(script|style|iframe|object|embed|form)[^>]*\/?>/gi, "")
      .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(
        /\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi,
        ' $1="#"',
      );
  }

  return createDOMPurify(window).sanitize(value, {
    ADD_ATTR: [
      "data-formula",
      "target",
      "rel",
      "color",
      "style",
      "colspan",
      "rowspan",
    ],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
  });
}

function renderMathFormulas(html: string): string {
  if (typeof document === "undefined") {
    return html;
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  template.content
    .querySelectorAll<HTMLElement>(".math-formula[data-formula]")
    .forEach((node) => {
      const formula = node.dataset.formula?.trim();

      if (!formula) {
        return;
      }

      node.innerHTML = renderMathToHtml(formula);
      node.setAttribute("title", formula);
    });

  return template.innerHTML;
}

function getPlainTextFromHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, "").trim();
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("*").forEach((node) => {
    const replacement = FALLBACK_TEXT_BY_TAG[node.tagName.toLowerCase()];

    if (replacement) {
      node.append(document.createTextNode(replacement));
    }
  });

  return template.content.textContent?.replace(/\u200B/g, "").trim() ?? "";
}

export function RichTextRenderer({
  html,
  fallback = "",
  className,
}: RichTextRendererProps) {
  const renderedHtml = useMemo(() => {
    const normalizedHtml = normalizeInputHtml(html ?? "");
    const sanitizedHtml = sanitizeHtml(normalizedHtml);

    return renderMathFormulas(sanitizedHtml);
  }, [html]);

  const hasContent = useMemo(
    () => getPlainTextFromHtml(renderedHtml).length > 0,
    [renderedHtml],
  );

  if (!hasContent) {
    return fallback ? (
      <p className={cn("text-[#94A3B8]", className)}>{fallback}</p>
    ) : null;
  }

  return (
    <div
      className={cn(RICH_TEXT_CONTENT_CLASS, className)}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      suppressHydrationWarning
    />
  );
}
