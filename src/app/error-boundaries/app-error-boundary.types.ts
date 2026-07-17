import type { ReactNode } from 'react';

export interface AppErrorBoundaryProps {
  readonly children: ReactNode;
}

export interface AppErrorBoundaryState {
  readonly hasError: boolean;
}
