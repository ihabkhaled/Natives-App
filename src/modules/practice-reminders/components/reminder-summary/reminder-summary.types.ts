import type { PracticeRemindersScreenView } from '../../types/practice-reminders-view.types';

/** The loaded body: counts, window, due kinds, actions, and the outcome list. */
export type ReminderSummaryProps = Omit<
  PracticeRemindersScreenView,
  'title' | 'subtitle' | 'isLoading' | 'loadingLabel' | 'isForbidden' | 'hasError' | 'errorMessage'
>;
