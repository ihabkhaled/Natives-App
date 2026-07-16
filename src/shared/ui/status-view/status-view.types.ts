import type { ReactNode } from 'react';

export type StatusTone = 'neutral' | 'danger' | 'warning';

export interface StatusViewProps {
  readonly icon: string;
  readonly title: string;
  readonly tone: StatusTone;
  readonly testId: string;
  readonly message?: string | undefined;
  readonly action?: ReactNode;
}
