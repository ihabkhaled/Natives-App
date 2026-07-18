/**
 * Shared presentation copy for async screens: the labels and handlers every
 * loading / error / offline surface needs. Feature view models extend this so
 * the common state block is defined once.
 */
export interface AsyncViewCopy {
  readonly loadingLabel: string;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly retryLabel: string;
  readonly onRetry: () => void;
  readonly offlineTitle: string;
  readonly offlineMessage: string;
  readonly offlineNoticeLabel: string;
  readonly isOffline: boolean;
}
