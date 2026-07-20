import type { StageRowView } from '../../types/competitions-view.types';

export interface CompetitionStageListProps {
  readonly items: readonly StageRowView[];
  readonly emptyLabel: string;
}
