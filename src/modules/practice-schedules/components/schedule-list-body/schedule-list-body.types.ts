import type { PracticeSchedulesListScreenView } from '../../types/practice-schedules-view.types';

/** The loaded list body: the new-schedule action, the count, and the rows. */
export type ScheduleListBodyProps = Omit<
  PracticeSchedulesListScreenView,
  'title' | 'subtitle' | 'isLoading' | 'loadingLabel' | 'isForbidden' | 'hasError' | 'errorTitle' | 'errorMessage'
>;
