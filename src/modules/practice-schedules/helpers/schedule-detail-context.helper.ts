import { SCHEDULE_STATUS } from '../constants/practice-schedules.constants';
import type { PracticeSchedule, ScheduleDraft } from '../types/practice-schedules.types';

export interface DetailReadEnabledInput {
  readonly isCreateMode: boolean;
  readonly contextLoading: boolean;
  readonly canManage: boolean;
}

/** The detail read never fires in create mode, or before the scope/grant resolve. */
export function resolveDetailReadEnabled(input: DetailReadEnabledInput): boolean {
  return !input.isCreateMode && !input.contextLoading && input.canManage;
}

export interface DetailLoadingInput {
  readonly contextLoading: boolean;
  readonly isCreateMode: boolean;
  readonly isPending: boolean;
}

/** Create mode is never blocked on a read that never fires. */
export function resolveDetailIsLoading(input: DetailLoadingInput): boolean {
  return input.contextLoading || (!input.isCreateMode && input.isPending);
}

/** A read failure only matters once there is a read to fail. */
export function resolveDetailHasError(isCreateMode: boolean, isError: boolean): boolean {
  return !isCreateMode && isError;
}

/** Withheld only once permissions have actually resolved, never mid-resolution. */
export function resolveDetailIsForbidden(isPermissionsLoading: boolean, canManage: boolean): boolean {
  return !isPermissionsLoading && !canManage;
}

/** Generating only makes sense for a record that still exists and is active. */
export function resolveCanGenerate(schedule: PracticeSchedule | undefined): boolean {
  return schedule?.status === SCHEDULE_STATUS.active;
}

/** The weekdays a freshly loaded (or blank) draft starts from. */
export function draftWeekdays(draft: ScheduleDraft | null): readonly number[] {
  return draft?.weekdays ?? [];
}
