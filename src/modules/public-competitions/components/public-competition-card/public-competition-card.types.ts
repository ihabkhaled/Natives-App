import type {
  PublicCompetitionCardView,
  PublicCompetitionsLabels,
} from '../../types/public-competitions-view.types';

export interface PublicCompetitionCardProps {
  readonly card: PublicCompetitionCardView;
  readonly labels: PublicCompetitionsLabels;
  /** Omitted on the detail header, where the card is already the destination. */
  readonly onOpen?: ((detailPath: string) => void) | undefined;
}
