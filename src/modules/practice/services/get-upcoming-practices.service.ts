import { isHttpError } from '@/packages/http';
import { nowIso } from '@/packages/date';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestPracticeRsvp, requestPracticeSessions } from '../gateways/practice.gateway';
import { mapPracticeSessionListPage } from '../mappers/practice-session.mapper';
import type { PracticeSessionSummary } from '../types/practice.types';

/** Use case: load the bounded upcoming list (offline-cacheable reads). */
export async function getUpcomingPractices(
  teamId: string,
  referenceIso: string = nowIso(),
): Promise<readonly PracticeSessionSummary[]> {
  try {
    const dto = await requestPracticeSessions({
      teamId,
      from: referenceIso,
      to: null,
      sessionType: null,
      limit: 5,
      offset: 0,
    });
    const rsvps = await Promise.all(
      dto.items.map((session) => requestPracticeRsvp(teamId, session.id)),
    );
    return mapPracticeSessionListPage(dto, rsvps).items;
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
