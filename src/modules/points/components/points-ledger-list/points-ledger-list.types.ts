import type { LedgerEntryView } from '../../types/points-view.types';

export interface PointsLedgerListProps {
  readonly entries: readonly LedgerEntryView[];
  readonly caption: string;
}
