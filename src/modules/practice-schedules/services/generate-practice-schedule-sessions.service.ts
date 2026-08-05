import { requestScheduleGenerate } from '../gateways/practice-schedules.gateway';
import type { GenerationResult, ScheduleItemParams } from '../types/practice-schedules.types';

/**
 * Turn the pattern into real sessions. Idempotent: calling this again for a
 * window already generated reports those occurrences as skipped rather than
 * duplicating them, so a coach can safely re-run it after extending the
 * pattern's generation window.
 */
export function generatePracticeScheduleSessions(
  params: ScheduleItemParams,
): Promise<GenerationResult> {
  return requestScheduleGenerate(params);
}
