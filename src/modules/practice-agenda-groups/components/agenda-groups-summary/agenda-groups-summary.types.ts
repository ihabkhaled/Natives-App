import type { PracticeAgendaGroupsScreenView } from '../../types/practice-agenda-groups-view.types';

/** The loaded body: status, the resolved plan, the groups, and both forms. */
export type AgendaGroupsSummaryProps = Omit<
  PracticeAgendaGroupsScreenView,
  | 'title'
  | 'subtitle'
  | 'isLoading'
  | 'loadingLabel'
  | 'isForbidden'
  | 'hasError'
  | 'errorMessage'
  | 'notice'
>;
