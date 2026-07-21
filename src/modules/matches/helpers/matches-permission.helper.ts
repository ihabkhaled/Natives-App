import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

/**
 * Convenience grant checks for the match screens. The backend remains the sole
 * authority: it re-authorizes every read, every scoring command, and every
 * finalization regardless of what these return.
 */
export function canReadMatches(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.matchRead]);
}

/** Recording points, timeouts, and corrections on the field. */
export function canScoreMatch(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.matchScore]);
}

/** Publishing the final score is its own grant, above plain scoring. */
export function canFinalizeMatch(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.matchFinalize]);
}

export function canReadMatchStatistics(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.matchStatsRead]);
}

/** Coaching analysis is readable either for the whole team or for oneself. */
export function canReadMatchAnalysis(granted: readonly string[]): boolean {
  return (
    hasAllPermissions(granted, [PERMISSIONS.matchAnalysisReadTeam]) ||
    hasAllPermissions(granted, [PERMISSIONS.matchAnalysisReadSelf])
  );
}
