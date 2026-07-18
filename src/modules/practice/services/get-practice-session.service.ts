import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestPracticeSession } from '../gateways/practice.gateway';
import { mapPracticeSessionDetail } from '../mappers/practice-session.mapper';
import type { PracticeSessionDetail } from '../types/practice.types';

/** Use case: load one practice session's full detail. */
export async function getPracticeSession(sessionId: string): Promise<PracticeSessionDetail> {
  try {
    const dto = await requestPracticeSession(sessionId);
    return mapPracticeSessionDetail(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
