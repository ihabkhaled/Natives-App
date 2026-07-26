import { APP_PATHS } from '@/shared/config';

/** Route pattern and navigation target for the team analytics screen. */
export function analyticsPagePath(): string {
  return APP_PATHS.analytics;
}

/** The player analytics route pattern (used by the route table). */
export function playerAnalyticsPattern(): string {
  return APP_PATHS.playerAnalytics;
}

/** A concrete player analytics target for one membership. */
export function playerAnalyticsPath(membershipId: string): string {
  return APP_PATHS.playerAnalytics.replace(':membershipId', encodeURIComponent(membershipId));
}
