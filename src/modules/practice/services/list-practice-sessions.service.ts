import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestPracticeSessions } from '../gateways/practice.gateway';
import { mapPracticeSessionListPage } from '../mappers/practice-session.mapper';
import type { PracticeSessionListPage, PracticeSessionQueryParams } from '../types/practice.types';

/** Use case: load one bounded, filtered page of the practice calendar. */
export async function listPracticeSessions(
  params: PracticeSessionQueryParams,
): Promise<PracticeSessionListPage> {
  try {
    const dto = await requestPracticeSessions(params);
    return mapPracticeSessionListPage(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
