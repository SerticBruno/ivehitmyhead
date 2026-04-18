/** Rolling windows for meme list `time_period` query params (not calendar buckets). */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns ISO range start for memes created at or after this instant, or null for `all`.
 */
export function getMemeTimePeriodStart(
  timePeriod: string | null | undefined,
  now: Date = new Date()
): Date | null {
  if (!timePeriod || timePeriod === 'all') {
    return null;
  }
  switch (timePeriod) {
    case 'today':
      // Deprecated UI value; treat like "all time" for old bookmarks/query strings.
      return null;
    case 'week':
      return new Date(now.getTime() - 7 * DAY_MS);
    case 'month':
      return new Date(now.getTime() - 30 * DAY_MS);
    default:
      return new Date(0);
  }
}
