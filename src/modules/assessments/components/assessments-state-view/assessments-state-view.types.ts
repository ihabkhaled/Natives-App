import type { AssessmentsStatus } from '../../types/assessments-view.types';

/** The subset of every assessment view model this shared state block reads. */
interface AssessmentsStateSource {
  readonly status: AssessmentsStatus;
  readonly loadingLabel: string;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly retryLabel: string;
  readonly onRetry: () => void;
  readonly offlineTitle: string;
  readonly offlineMessage: string;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
}

export interface AssessmentsStateViewProps {
  readonly view: AssessmentsStateSource;
  readonly variant: 'card' | 'dashboard' | 'detail' | 'list';
  readonly loadingTestId: string;
  readonly errorTestId: string;
  readonly offlineTestId: string;
  readonly forbiddenTestId: string;
  readonly emptyTestId: string;
}
