import { getAppHttpClient } from '@/packages/http';

import {
  scheduleCollectionPath,
  scheduleGeneratePath,
  scheduleItemPath,
} from '../constants/practice-schedules-api.constants';
import {
  toGenerationResult,
  toPracticeSchedule,
  toPracticeScheduleListPage,
  type ScheduleWriteBody,
} from '../mappers/practice-schedules.mapper';
import {
  generationResultResponseSchema,
  listSchedulesResponseSchema,
  scheduleResponseSchema,
} from '../schemas/practice-schedules.schema';
import type {
  GenerationResult,
  PracticeSchedule,
  PracticeScheduleListPage,
  ScheduleItemParams,
  ScheduleTeamParams,
} from '../types/practice-schedules.types';

/** A team's recurring practice patterns. */
export async function requestScheduleList(
  params: ScheduleTeamParams,
): Promise<PracticeScheduleListPage> {
  const dto = await getAppHttpClient().get(
    scheduleCollectionPath(params.teamId),
    listSchedulesResponseSchema,
  );
  return toPracticeScheduleListPage(dto);
}

/** One pattern's full detail. */
export async function requestSchedule(params: ScheduleItemParams): Promise<PracticeSchedule> {
  const dto = await getAppHttpClient().get(
    scheduleItemPath(params.teamId, params.scheduleId),
    scheduleResponseSchema,
  );
  return toPracticeSchedule(dto);
}

/** Define a new recurring pattern. */
export async function requestScheduleCreate(
  params: ScheduleTeamParams,
  body: ScheduleWriteBody,
): Promise<PracticeSchedule> {
  const dto = await getAppHttpClient().post(
    scheduleCollectionPath(params.teamId),
    body,
    scheduleResponseSchema,
  );
  return toPracticeSchedule(dto);
}

/**
 * `UpdateScheduleDto` is a full replace guarded by `expectedVersion`, not a
 * sparse patch — the caller must send every field the schema requires, which
 * `toUpdateScheduleBody` builds.
 */
export async function requestScheduleUpdate(
  params: ScheduleItemParams,
  body: ScheduleWriteBody,
): Promise<PracticeSchedule> {
  const dto = await getAppHttpClient().patch(
    scheduleItemPath(params.teamId, params.scheduleId),
    body,
    scheduleResponseSchema,
  );
  return toPracticeSchedule(dto);
}

/**
 * Archive the pattern. The contract answers with the archived record, but the
 * shared HTTP client's `delete` never parses a response body — every caller
 * refetches or navigates away, so there is nothing to gain by adding a second
 * response path just for this one write.
 */
export function requestScheduleArchive(params: ScheduleItemParams): Promise<void> {
  return getAppHttpClient().delete(scheduleItemPath(params.teamId, params.scheduleId));
}

/**
 * Turn the pattern into real sessions. Idempotent server-side: occurrences
 * already generated come back as `skipped`, never duplicated.
 */
export async function requestScheduleGenerate(
  params: ScheduleItemParams,
): Promise<GenerationResult> {
  const dto = await getAppHttpClient().post(
    scheduleGeneratePath(params.teamId, params.scheduleId),
    {},
    generationResultResponseSchema,
  );
  return toGenerationResult(dto);
}
