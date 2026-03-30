/** Rolling windows for meme list `time_period` query params (not calendar buckets). */
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

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
      return new Date(now.getTime() - 24 * HOUR_MS);
    case 'week':
      return new Date(now.getTime() - 7 * DAY_MS);
    case 'month':
      return new Date(now.getTime() - 30 * DAY_MS);
    default:
      return new Date(0);
  }
}
