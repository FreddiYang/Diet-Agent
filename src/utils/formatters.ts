/**
 * Number formatting and rounding utilities.
 * Ensures all numbers are strictly limited to at most two decimal digits behind the "."
 * (e.g., 50.49, 50.69, or clean integers like 50).
 */

/**
 * Rounds a number to at most 2 decimal digits behind the '.'
 * Resolves JavaScript floating-point inaccuracies like 0.1 + 0.2 = 0.30000000000000004
 */
export function roundToTwo(val: number | string | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0;
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Formats any number or numeric string to have at most 2 decimal digits behind the '.'
 * E.g.:
 *  50.49123 -> "50.49"
 *  50.69000 -> "50.69"
 *  50 -> "50"
 */
export function formatNum(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return '0';
  const rounded = roundToTwo(num);
  return rounded.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    useGrouping: false,
  });
}

/**
 * Safe subtraction with 2 decimal precision
 */
export function sub2(a: number, b: number): number {
  return roundToTwo(roundToTwo(a) - roundToTwo(b));
}

/**
 * Safe addition with 2 decimal precision
 */
export function add2(a: number, b: number): number {
  return roundToTwo(roundToTwo(a) + roundToTwo(b));
}
