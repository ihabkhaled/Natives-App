import type { CompetitionCardView } from '../../types/competitions-view.types';

export interface CompetitionCardProps {
  readonly item: CompetitionCardView;
  readonly onOpen: (competitionId: string) => void;
}
