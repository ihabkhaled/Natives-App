import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  PRACTICE_API_PATHS,
  practiceRsvpPath,
  practiceSessionDetailPath,
} from '../constants/practice-api.constants';
import {
  practiceSessionDetailSchema,
  practiceSessionListResponseSchema,
  upcomingPracticesResponseSchema,
} from '../schemas/practice-session.schema';
import type { PracticeSessionQueryParams, RsvpSubmission } from '../types/practice.types';

type ListDto = SchemaOutput<typeof practiceSessionListResponseSchema>;
type UpcomingDto = SchemaOutput<typeof upcomingPracticesResponseSchema>;
type DetailDto = SchemaOutput<typeof practiceSessionDetailSchema>;

function toQueryParams(params: PracticeSessionQueryParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    scope: params.scope,
    pageSize: params.pageSize,
  };
  if (params.type !== null) {
    query['type'] = params.type;
  }
  if (params.rsvp !== null) {
    query['rsvp'] = params.rsvp;
  }
  return query;
}

/** Bounded, filtered, deterministically ordered calendar page. */
export function requestPracticeSessions(params: PracticeSessionQueryParams): Promise<ListDto> {
  return getAppHttpClient().get(PRACTICE_API_PATHS.sessions, practiceSessionListResponseSchema, {
    params: toQueryParams(params),
  });
}

/** Bounded upcoming list (offline-cacheable approved reads). */
export function requestUpcomingPractices(): Promise<UpcomingDto> {
  return getAppHttpClient().get(PRACTICE_API_PATHS.upcoming, upcomingPracticesResponseSchema);
}

/** One authenticated session detail, schema-parsed. */
export function requestPracticeSession(sessionId: string): Promise<DetailDto> {
  return getAppHttpClient().get(practiceSessionDetailPath(sessionId), practiceSessionDetailSchema);
}

/** Self-RSVP write; the server returns the authoritative updated detail. */
export function requestRsvpUpdate(
  sessionId: string,
  submission: RsvpSubmission,
): Promise<DetailDto> {
  return getAppHttpClient().put(
    practiceRsvpPath(sessionId),
    submission,
    practiceSessionDetailSchema,
  );
}
