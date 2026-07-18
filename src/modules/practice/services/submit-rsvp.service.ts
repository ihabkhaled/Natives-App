import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestRsvpUpdate } from '../gateways/practice.gateway';
import { mapRsvpUpdate } from '../mappers/practice-session.mapper';
import type { RsvpSubmission, RsvpUpdate } from '../types/practice.types';

/**
 * Use case: submit or change the member's own RSVP. The server re-checks the
 * deadline, capacity, and version; a stale version surfaces as a CONFLICT
 * AppError so the UI can recover with the authoritative latest state.
 */
export async function submitRsvp(
  teamId: string,
  sessionId: string,
  submission: RsvpSubmission,
): Promise<RsvpUpdate> {
  try {
    const dto = await requestRsvpUpdate(teamId, sessionId, submission);
    return mapRsvpUpdate(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
