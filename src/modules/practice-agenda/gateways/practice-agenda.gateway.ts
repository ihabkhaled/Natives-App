import { getAppHttpClient } from '@/packages/http';

import {
  practiceAgendaReorderPath,
  practiceAgendaResourcePath,
  practiceAgendaStationPath,
} from '../constants/practice-agenda-api.constants';
import {
  agendaResponseSchema,
  agendaSummaryResponseSchema,
} from '../schemas/practice-agenda.schema';
import type {
  AgendaRequestParams,
  AgendaSummary,
  PracticeAgenda,
  RemoveStationCommand,
  ReorderBlocksCommand,
} from '../types/practice-agenda.types';

/** The whole plan in one read: blocks with their stations already nested. */
export function requestPracticeAgenda(params: AgendaRequestParams): Promise<PracticeAgenda> {
  return getAppHttpClient().get(
    practiceAgendaResourcePath(params.teamId, params.sessionId),
    agendaResponseSchema,
  );
}

/**
 * Commit a new block order. The complete id list travels, and `expectedVersion`
 * with it, so the server refuses the move when the plan changed underneath the
 * coach instead of silently overwriting the change they never saw.
 */
export function requestBlockReorder(command: ReorderBlocksCommand): Promise<AgendaSummary> {
  return getAppHttpClient().post(
    practiceAgendaReorderPath(command.teamId, command.sessionId),
    {
      blockIds: command.blockIds,
      ...(command.expectedVersion === null ? {} : { expectedVersion: command.expectedVersion }),
    },
    agendaSummaryResponseSchema,
  );
}

/** Drop one station from a block; the server answers 204 with no body. */
export function requestStationRemoval(command: RemoveStationCommand): Promise<void> {
  return getAppHttpClient().delete(
    practiceAgendaStationPath(
      command.teamId,
      command.sessionId,
      command.blockId,
      command.stationId,
    ),
  );
}
