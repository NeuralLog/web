/**
 * Date utility functions
 */

/**
 * Format a date in a consistent way that avoids hydration errors
 *
 * This function uses UTC methods to ensure the same output on both server and client
 *
 * @param timestamp ISO timestamp string or Date object
 * @returns Formatted date string in UTC
 */
export function formatDate(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Use UTC methods to ensure consistent rendering between server and client
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')} UTC`;
}

/**
 * Format a date in a human-readable format
 *
 * WARNING: This function should only be used in client components after hydration
 * as it uses locale-specific formatting which can cause hydration errors
 *
 * @param timestamp ISO timestamp string or Date object
 * @returns Locale-formatted date string
 */
export function formatDateLocale(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
