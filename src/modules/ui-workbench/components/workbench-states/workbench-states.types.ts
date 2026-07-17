export interface WorkbenchStatesProps {
  readonly heading: string;
  readonly loadingLabel: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly errorTitle: string;
  readonly retryLabel: string;
  readonly offlineTitle: string;
  readonly offlineMessage: string;
  readonly permissionTitle: string;
  readonly permissionMessage: string;
  readonly onRetryDemo: () => void;
}
