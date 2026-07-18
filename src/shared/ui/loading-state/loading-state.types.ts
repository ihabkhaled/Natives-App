export type LoadingStateVariant = 'card' | 'dashboard' | 'detail' | 'list';

export interface LoadingStateProps {
  readonly label: string;
  readonly testId?: string | undefined;
  readonly variant?: LoadingStateVariant | undefined;
}
