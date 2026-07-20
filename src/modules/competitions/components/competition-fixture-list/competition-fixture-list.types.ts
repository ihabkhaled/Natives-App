import type { FixtureRowView } from '../../types/competitions-view.types';

export interface CompetitionFixtureListProps {
  readonly items: readonly FixtureRowView[];
  readonly emptyLabel: string;
}
