import type { WorkbenchItem } from '../../helpers/workbench-items.helper';

export interface WorkbenchListProps {
  readonly heading: string;
  readonly items: readonly WorkbenchItem[];
  readonly emptyTitle: string;
}
