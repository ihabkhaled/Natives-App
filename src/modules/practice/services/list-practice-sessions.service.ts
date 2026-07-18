import { isHttpError } from '@/packages/http';
import { nowIso } from '@/packages/date';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestPracticeRsvp, requestPracticeSessions } from '../gateways/practice.gateway';
import {
  filterPracticePageByRsvp,
  filterPracticePageByType,
  mapPracticeSessionListPage,
  toBackendSessionType,
} from '../mappers/practice-session.mapper';
import { PRACTICE_SCOPE } from '../constants/practice.constants';
import type { PracticeSessionListPage, PracticeSessionQueryParams } from '../types/practice.types';

/** Use case: load one bounded, filtered page of the practice calendar. */
export async function listPracticeSessions(
  teamId: string,
  params: PracticeSessionQueryParams,
  referenceIso: string = nowIso(),
): Promise<PracticeSessionListPage> {
  try {
    const dto = await requestPracticeSessions({
      teamId,
      from: params.scope === PRACTICE_SCOPE.upcoming ? referenceIso : null,
      to: params.scope === PRACTICE_SCOPE.past ? referenceIso : null,
      sessionType: toBackendSessionType(params.type),
      limit: params.pageSize,
      offset: 0,
    });
    const rsvps = await Promise.all(
      dto.items.map((session) => requestPracticeRsvp(teamId, session.id)),
    );
    const page = mapPracticeSessionListPage(dto, rsvps);
    return filterPracticePageByRsvp(filterPracticePageByType(page, params.type), params.rsvp);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
