import { getAppHttpClient } from '@/packages/http';
import type {
  PracticeSessionListQueryContract,
  SetRsvpRequestContract,
} from '@/packages/api-contract';
import type { SchemaOutput } from '@/packages/schema';

import {
  practiceRsvpPath,
  practiceSessionDetailPath,
  practiceSessionsPath,
} from '../constants/practice-api.constants';
import {
  practiceRsvpResponseSchema,
  practiceSessionListResponseSchema,
  practiceSessionResponseSchema,
} from '../schemas/practice-session.schema';
import type { PracticeSessionRequestParams, RsvpSubmission } from '../types/practice.types';

type ListDto = SchemaOutput<typeof practiceSessionListResponseSchema>;
type SessionDto = SchemaOutput<typeof practiceSessionResponseSchema>;
type RsvpDto = SchemaOutput<typeof practiceRsvpResponseSchema>;

function toQueryParams(params: PracticeSessionRequestParams): PracticeSessionListQueryContract {
  return {
    limit: params.limit,
    offset: params.offset,
    ...(params.from === null ? {} : { from: params.from }),
    ...(params.to === null ? {} : { to: params.to }),
    ...(params.sessionType === null ? {} : { sessionType: params.sessionType }),
  };
}

/** Bounded, filtered, deterministically ordered calendar page. */
export function requestPracticeSessions(params: PracticeSessionRequestParams): Promise<ListDto> {
  return getAppHttpClient().get(
    practiceSessionsPath(params.teamId),
    practiceSessionListResponseSchema,
    { params: toQueryParams(params) },
  );
}

/** One authenticated session detail, schema-parsed. */
export function requestPracticeSession(teamId: string, sessionId: string): Promise<SessionDto> {
  return getAppHttpClient().get(
    practiceSessionDetailPath(teamId, sessionId),
    practiceSessionResponseSchema,
  );
}

/** The authenticated membership's RSVP state for one session. */
export function requestPracticeRsvp(teamId: string, sessionId: string): Promise<RsvpDto> {
  return getAppHttpClient().get(practiceRsvpPath(teamId, sessionId), practiceRsvpResponseSchema);
}

/** Self-RSVP write; the server returns the authoritative RSVP resource. */
export function requestRsvpUpdate(
  teamId: string,
  sessionId: string,
  submission: RsvpSubmission,
): Promise<RsvpDto> {
  const request: SetRsvpRequestContract = {
    status: submission.status,
    ...(submission.reasonCategory === null ? {} : { reasonCategory: submission.reasonCategory }),
    ...(submission.version === null ? {} : { expectedVersion: submission.version }),
  };
  return getAppHttpClient().put(
    practiceRsvpPath(teamId, sessionId),
    request,
    practiceRsvpResponseSchema,
  );
}
