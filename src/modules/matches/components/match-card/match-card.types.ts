import type { MatchCardView } from '../../types/matches-view.types';

export interface MatchCardProps {
  readonly item: MatchCardView;
  readonly onOpenScoreboard: (matchId: string) => void;
  readonly onOpenStatistics: (matchId: string) => void;
}
