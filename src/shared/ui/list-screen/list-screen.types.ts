import type { ReactNode } from 'react';

import type { AsyncStateViewProps } from '../async-state-view';
import type { SelectFieldProps } from '../select-field';

export interface ListScreenProps {
  readonly title: string;
  readonly subtitle: string;
  readonly pageTestId: string;
  readonly viewTestId: string;
  readonly className: string;
  readonly filters: readonly SelectFieldProps[];
  readonly filterExtra?: ReactNode;
  readonly state: AsyncStateViewProps;
  readonly countLabel: string;
  readonly hasMatches: boolean;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly children: ReactNode;
}
