import type { RosterCardView } from '../../types/rosters-view.types';

export interface RosterCardProps {
  readonly item: RosterCardView;
  readonly onOpen: (rosterId: string) => void;
}
