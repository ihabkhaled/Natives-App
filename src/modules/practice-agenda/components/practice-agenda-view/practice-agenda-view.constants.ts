import { TEST_IDS } from '@/shared/config';

/** The state test ids the shared AsyncStateView stamps on this screen. */
export const PRACTICE_AGENDA_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.practiceAgendaLoading,
  errorTestId: TEST_IDS.practiceAgendaError,
  offlineTestId: TEST_IDS.practiceAgendaOffline,
  forbiddenTestId: TEST_IDS.practiceAgendaForbidden,
  emptyTestId: TEST_IDS.practiceAgendaEmpty,
} as const;
