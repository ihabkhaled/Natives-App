import type { ReactNode } from 'react';

export interface SectionPanelProps {
  readonly heading: string;
  readonly intro?: string;
  readonly notice?: string | null;
  readonly children: ReactNode;
  readonly testId?: string;
}
