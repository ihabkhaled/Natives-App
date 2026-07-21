import { I18N_KEYS } from '@/shared/i18n';

import { MATCH_STATUS } from '../constants/matches.constants';
import type { MatchStatus } from '../constants/matches.constants';

export interface FinalizeGuardInput {
  readonly status: MatchStatus;
  readonly queuedCount: number;
  readonly scoreboardStreamVersion: number;
  readonly lastKnownStreamVersion: number;
  readonly canFinalize: boolean;
}

export interface FinalizeGuardResult {
  readonly allowed: boolean;
  readonly blockedKey: string | null;
}

/**
 * Finalization is refused unless the field and the server agree completely.
 *
 * Three independent conditions, each fatal on its own:
 *  - nothing may still be queued, or the published score would omit a point
 *    that is still sitting on the device;
 *  - the scoreboard must be at or ahead of the last stream version this client
 *    observed, so a stale projection cannot publish an old score;
 *  - the match must be completed, which is the only status the backend
 *    finalizes from.
 */
export function evaluateFinalizeGuard(input: FinalizeGuardInput): FinalizeGuardResult {
  if (input.queuedCount > 0) {
    return { allowed: false, blockedKey: I18N_KEYS.scoreboard.finalizeBlockedQueue };
  }
  if (input.scoreboardStreamVersion < input.lastKnownStreamVersion) {
    return { allowed: false, blockedKey: I18N_KEYS.scoreboard.finalizeBlockedStale };
  }
  if (input.status !== MATCH_STATUS.Completed) {
    return { allowed: false, blockedKey: I18N_KEYS.scoreboard.finalizeBlockedStatus };
  }
  return input.canFinalize
    ? { allowed: true, blockedKey: null }
    : { allowed: false, blockedKey: I18N_KEYS.scoreboard.permissionNotice };
}

/** A finalized match is read-only; the database refuses any later write. */
export function isMatchImmutable(status: MatchStatus): boolean {
  return status === MATCH_STATUS.Finalized || status === MATCH_STATUS.Abandoned;
}
