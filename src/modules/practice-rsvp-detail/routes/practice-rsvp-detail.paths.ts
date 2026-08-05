import { APP_PATHS } from '@/shared/config';

export const PRACTICE_RSVP_DETAIL_SESSION_ID_PARAM = 'sessionId';

/** The route pattern, with its parameter still unresolved. */
export function practiceRsvpDetailPattern(): string {
  return APP_PATHS.practiceRsvpDetail;
}

/** The RSVP-detail screen for one session id. */
export function practiceRsvpDetailPath(sessionId: string): string {
  return APP_PATHS.practiceRsvpDetail.replace(
    `:${PRACTICE_RSVP_DETAIL_SESSION_ID_PARAM}`,
    encodeURIComponent(sessionId),
  );
}
