/** The one non-ready state a screen is currently presenting, or `ready`. */
export type AsyncViewStatus = 'loading' | 'error' | 'offline' | 'forbidden' | 'empty' | 'ready';

/** The subset of a screen view model this shared state block reads. */
interface AsyncStateSource {
  readonly status: AsyncViewStatus;
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

export interface AsyncStateViewProps {
  readonly view: AsyncStateSource;
  readonly variant: 'card' | 'dashboard' | 'detail' | 'list';
  readonly loadingTestId: string;
  readonly errorTestId: string;
  readonly offlineTestId: string;
  readonly forbiddenTestId: string;
  readonly emptyTestId: string;
}
