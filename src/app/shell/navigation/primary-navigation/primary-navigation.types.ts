import type { PrimaryNavItem } from '../navigation.types';

export interface PrimaryNavigationProps {
  readonly ariaLabel: string;
  readonly items: readonly PrimaryNavItem[];
}
