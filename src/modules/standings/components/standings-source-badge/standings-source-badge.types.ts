import type { ChipView, ProvenanceView } from '../../types/standings-view.types';

export interface StandingsSourceBadgeProps {
  readonly badge: ChipView;
  readonly provenance: ProvenanceView | null;
}
