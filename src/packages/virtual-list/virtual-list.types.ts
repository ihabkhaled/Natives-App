import type { ReactNode } from 'react';

export interface AppVirtualListProps<Item> {
  readonly items: readonly Item[];
  readonly renderItem: (item: Item, index: number) => ReactNode;
  readonly heightPx: number;
  readonly overscan?: number | undefined;
  readonly testId?: string | undefined;
}
