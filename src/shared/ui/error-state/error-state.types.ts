export interface ErrorStateProps {
  readonly title: string;
  readonly message?: string | undefined;
  readonly retryLabel?: string | undefined;
  readonly onRetry?: (() => void) | undefined;
  readonly testId?: string | undefined;
}
