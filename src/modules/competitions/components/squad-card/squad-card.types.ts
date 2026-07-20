import type { SquadCardView } from '../../types/competitions-view.types';

export interface SquadCardProps {
  readonly item: SquadCardView;
  readonly onOpen: (squadId: string) => void;
}
