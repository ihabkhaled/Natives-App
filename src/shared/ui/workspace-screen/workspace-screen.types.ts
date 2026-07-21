import type { ReactNode } from 'react';

import type { AsyncStateViewProps } from '../async-state-view';

export interface WorkspaceScreenProps {
  readonly title: string;
  readonly subtitle: string;
  readonly pageTestId: string;
  readonly viewTestId: string;
  readonly className: string;
  /** Advisory line above the content, or null when there is nothing to say. */
  readonly notice?: string | null;
  readonly toolbar?: ReactNode;
  readonly state: AsyncStateViewProps;
  readonly children: ReactNode;
}
