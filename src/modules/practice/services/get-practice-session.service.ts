import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestPracticeRsvp, requestPracticeSession } from '../gateways/practice.gateway';
import { mapPracticeSessionDetail } from '../mappers/practice-session.mapper';
import type { PracticeSessionDetail } from '../types/practice.types';

/** Use case: load one practice session's full detail. */
export async function getPracticeSession(
  teamId: string,
  sessionId: string,
): Promise<PracticeSessionDetail> {
  try {
    const [session, rsvp] = await Promise.all([
      requestPracticeSession(teamId, sessionId),
      requestPracticeRsvp(teamId, sessionId),
    ]);
    return mapPracticeSessionDetail(session, rsvp);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
