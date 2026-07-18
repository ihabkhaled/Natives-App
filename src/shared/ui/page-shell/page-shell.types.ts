import type { ReactNode } from 'react';

export interface PageShellProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly testId?: string;
  readonly headerEnd?: ReactNode;
  readonly banner?: ReactNode;
  readonly immersive?: boolean;
}
