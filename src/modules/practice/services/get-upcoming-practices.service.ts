import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestUpcomingPractices } from '../gateways/practice.gateway';
import { mapUpcomingPractices } from '../mappers/practice-session.mapper';
import type { PracticeSessionSummary } from '../types/practice.types';

/** Use case: load the bounded upcoming list (offline-cacheable reads). */
export async function getUpcomingPractices(): Promise<readonly PracticeSessionSummary[]> {
  try {
    const dto = await requestUpcomingPractices();
    return mapUpcomingPractices(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
