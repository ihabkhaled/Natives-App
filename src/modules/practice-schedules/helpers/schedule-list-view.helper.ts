import { I18N_KEYS } from '@/shared/i18n';

import type { PracticeScheduleListPage } from '../types/practice-schedules.types';
import type { PracticeSchedulesListScreenView } from '../types/practice-schedules-view.types';
import { buildScheduleRow } from './schedule-row.helper';

const KEYS = I18N_KEYS.practiceSchedules;

/** Translate with optional interpolation, as the i18n package exposes it. */
type Translate = (key: string, params?: Readonly<Record<string, number>>) => string;

/** Everything the list screen needs that is not copy. */
export interface SchedulesListViewInput {
  readonly page: PracticeScheduleListPage | undefined;
  readonly isLoading: boolean;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly onNew: () => void;
  readonly onOpen: (scheduleId: string) => void;
  readonly detailPathFor: (scheduleId: string) => string;
}

/** Static copy — the strings that never depend on server state. */
function buildChrome(
  t: Translate,
): Pick<
  PracticeSchedulesListScreenView,
  'title' | 'subtitle' | 'loadingLabel' | 'errorTitle' | 'errorMessage' | 'newLabel' | 'emptyTitle' | 'emptyMessage'
> {
  return {
    title: t(KEYS.title),
    subtitle: t(KEYS.subtitle),
    loadingLabel: t(KEYS.loadingLabel),
    errorTitle: t(KEYS.errorTitle),
    errorMessage: t(KEYS.errorMessage),
    newLabel: t(KEYS.newLabel),
    emptyTitle: t(KEYS.emptyTitle),
    emptyMessage: t(KEYS.emptyMessage),
  };
}

/**
 * Assemble the whole list view from static copy plus the loaded page.
 *
 * Extracted from the screen hook so the hook only wires the query and
 * navigation callbacks, and every piece of copy resolution is testable
 * without rendering.
 */
export function buildSchedulesListView(
  t: Translate,
  input: SchedulesListViewInput,
): PracticeSchedulesListScreenView {
  const items = input.page?.items ?? [];
  const rows = items.map((schedule) =>
    buildScheduleRow(t, schedule, input.detailPathFor(schedule.id)),
  );
  return {
    ...buildChrome(t),
    isLoading: input.isLoading,
    isForbidden: input.isForbidden,
    hasError: input.hasError,
    onNew: input.onNew,
    countLabel: t(KEYS.countLabel, { count: rows.length }),
    hasSchedules: rows.length > 0,
    rows,
    onOpen: input.onOpen,
  };
}
