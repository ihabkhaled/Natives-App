import type { DrillCardView } from '../../types/drills-view.types';

export interface DrillCardProps {
  readonly item: DrillCardView;
  readonly onOpen: (drillId: string) => void;
}
