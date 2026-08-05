import type { PracticeScheduleDetailScreenView } from '../../types/practice-schedules-view.types';

/** The loaded detail body: status, the form, and the delete/generate actions. */
export type ScheduleDetailBodyProps = Omit<
  PracticeScheduleDetailScreenView,
  'title' | 'heading' | 'isLoading' | 'loadingLabel' | 'isForbidden' | 'hasError' | 'errorTitle' | 'errorMessage' | 'backLabel' | 'onBack'
>;
