import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestRsvpUpdate } from '../gateways/practice.gateway';
import { mapPracticeSessionDetail } from '../mappers/practice-session.mapper';
import type { PracticeSessionDetail, RsvpSubmission } from '../types/practice.types';

/**
 * Use case: submit or change the member's own RSVP. The server re-checks the
 * deadline, capacity, and version; a stale version surfaces as a CONFLICT
 * AppError so the UI can recover with the authoritative latest state.
 */
export async function submitRsvp(
  sessionId: string,
  submission: RsvpSubmission,
): Promise<PracticeSessionDetail> {
  try {
    const dto = await requestRsvpUpdate(sessionId, submission);
    return mapPracticeSessionDetail(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
