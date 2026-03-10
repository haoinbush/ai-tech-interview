import type { OutputContent } from '@/components/OutputPanel';

/**
 * Normalize output for comparison. For tables, sort rows for order-independent comparison.
 * Column names are ignored for tables (only row values matter) since SQL allows different aliases.
 */
function normalizeForCompare(output: Exclude<OutputContent, null>): string {
  if (output.type === 'error') {
    return `error:${output.message}`;
  }
  if (output.type === 'text') {
    return output.content.trim();
  }
  // Table: sort rows by stringified form for order-independent comparison
  // Compare values only (column names can differ, e.g. repeated_payments vs payment_count)
  const rowStrings = output.rows.map((row) =>
    JSON.stringify(row.map((c) => (c === null ? 'NULL' : String(c))))
  );
  rowStrings.sort();
  return JSON.stringify(rowStrings);
}

export function outputsMatch(
  user: OutputContent,
  expected: OutputContent
): boolean {
  if (!user || !expected) return false;
  if (user.type === 'error' || expected.type === 'error') return false;
  return normalizeForCompare(user) === normalizeForCompare(expected);
}
