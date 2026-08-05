import type { RsvpStatus } from '@/modules/practice';

import { RSVP_STATUS_FILTER_ALL } from '../constants/practice-rsvp-detail.constants';
import { getRsvpHistory } from '../services/get-rsvp-history.service';
import { getRsvpSummary } from '../services/get-rsvp-summary.service';
import { listRsvpParticipants } from '../services/list-rsvp-participants.service';
import type {
  RsvpDetailRequestParams,
  RsvpHistory,
  RsvpParticipantsPage,
  RsvpSummary,
} from '../types/practice-rsvp-detail.types';
import { practiceRsvpDetailQueryKeys } from './practice-rsvp-detail.keys';

/**
 * Query options for the roster, at a growing `limit` and offset always zero.
 *
 * "Load more" widens the window instead of paging through it — the same
 * choice `practice`'s own calendar makes — so the roster a coach is already
 * reading never shifts under them mid-review. `enabled` guards the empty
 * session id: a route that failed to match must not fire a read at
 * `/practice-sessions//rsvps`.
 */
export function buildRsvpParticipantsQueryOptions(
  params: RsvpDetailRequestParams,
  limit: number,
  status: RsvpStatus | typeof RSVP_STATUS_FILTER_ALL,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<RsvpParticipantsPage>;
  readonly enabled: boolean;
} {
  return {
    queryKey: practiceRsvpDetailQueryKeys.participants(
      params.teamId,
      params.sessionId,
      limit,
      status,
    ),
    queryFn: (): Promise<RsvpParticipantsPage> =>
      listRsvpParticipants({
        teamId: params.teamId,
        sessionId: params.sessionId,
        limit,
        offset: 0,
        status: status === RSVP_STATUS_FILTER_ALL ? null : status,
      }),
    enabled: params.sessionId !== '',
  };
}

/** Query options for the session's privacy-safe planning summary. */
export function buildRsvpSummaryQueryOptions(params: RsvpDetailRequestParams): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<RsvpSummary>;
  readonly enabled: boolean;
} {
  return {
    queryKey: practiceRsvpDetailQueryKeys.summary(params.teamId, params.sessionId),
    queryFn: (): Promise<RsvpSummary> => getRsvpSummary(params),
    enabled: params.sessionId !== '',
  };
}

/**
 * Query options for one member's revision trail. `enabled` also guards the
 * empty membership id: history is read only for a member a coach has
 * deliberately opened, never speculatively for the whole roster.
 */
export function buildRsvpHistoryQueryOptions(
  params: RsvpDetailRequestParams,
  membershipId: string,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<RsvpHistory>;
  readonly enabled: boolean;
} {
  return {
    queryKey: practiceRsvpDetailQueryKeys.history(params.teamId, params.sessionId, membershipId),
    queryFn: (): Promise<RsvpHistory> => getRsvpHistory({ ...params, membershipId }),
    enabled: params.sessionId !== '' && membershipId !== '',
  };
}
