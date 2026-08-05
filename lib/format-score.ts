/**
 * Formats a score / point value into a clean human-readable decimal string.
 * Examples:
 * - 9.999999999999996 -> "10"
 * - 10.0 -> "10"
 * - 9.5 -> "9.5"
 * - 5.25 -> "5.25"
 * - 7.2 -> "7.2"
 * - 3.333333 -> "3.33"
 */
export function formatScore(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "--";
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return String(value);

  // Round to 2 decimal places to eliminate floating point imprecision
  const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
  return String(rounded);
}
