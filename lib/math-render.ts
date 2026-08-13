import katex from "katex";
import "katex/contrib/mhchem";

export function renderMathToHtml(formula: string): string {
  return katex.renderToString(formula, {
    displayMode: false,
    output: "htmlAndMathml",
    strict: false,
    throwOnError: false,
    trust: false,
  });
}
