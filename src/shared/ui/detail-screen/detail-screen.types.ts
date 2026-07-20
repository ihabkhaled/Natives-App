import type { ReactNode } from 'react';

import type { AsyncStateViewProps } from '../async-state-view';

export interface DetailScreenProps {
  readonly title: string;
  readonly heading: string;
  readonly pageTestId: string;
  readonly viewTestId: string;
  readonly className: string;
  readonly backLabel: string;
  readonly backTestId?: string;
  readonly onBack: () => void;
  readonly state: AsyncStateViewProps;
  readonly notice: string | null;
  readonly children: ReactNode;
}
