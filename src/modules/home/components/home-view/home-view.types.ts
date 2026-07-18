import type { ReactNode } from 'react';

import type { HomeScreenView } from '../../hooks/use-home-screen.hook';

export interface HomeViewProps extends HomeScreenView {
  readonly dashboardSlot: ReactNode;
  readonly healthSlot: ReactNode;
}
