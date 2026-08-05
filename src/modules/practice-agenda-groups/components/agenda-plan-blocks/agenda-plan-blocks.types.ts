import type { ResolvedBlockView } from '../../types/practice-agenda-groups-view.types';

export interface AgendaPlanBlocksProps {
  readonly heading: string;
  readonly emptyLabel: string;
  readonly blocks: readonly ResolvedBlockView[];
}
