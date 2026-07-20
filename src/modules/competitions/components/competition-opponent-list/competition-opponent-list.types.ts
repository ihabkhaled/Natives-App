import type { OpponentRowView } from '../../types/competitions-view.types';

export interface CompetitionOpponentListProps {
  readonly items: readonly OpponentRowView[];
  readonly emptyLabel: string;
}
