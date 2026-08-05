import type { ReminderTestResult } from '../types/practice-reminders.types';

/** The wire shape of a self-test, where `reason` may be absent OR null. */
interface ReminderTestDto {
  readonly enqueued: boolean;
  readonly reason?: ReminderTestResult['reason'] | undefined;
}

/**
 * Collapse "absent" and "null" into one thing.
 *
 * The contract marks `reason` optional, so a queued test omits it entirely
 * while a refusal carries it. Leaving both shapes to reach the screen would
 * make every reader handle two spellings of "no reason", so the domain type
 * has one and the mapping happens here.
 */
export function toReminderTestResult(dto: ReminderTestDto): ReminderTestResult {
  return { enqueued: dto.enqueued, reason: dto.reason ?? null };
}
