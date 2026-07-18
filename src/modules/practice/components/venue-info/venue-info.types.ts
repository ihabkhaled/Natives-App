import type { PracticeVenueView } from '../../types/practice-view.types';

export interface VenueInfoProps {
  readonly heading: string;
  readonly venue: PracticeVenueView | null;
  readonly tbdLabel: string;
  readonly onOpenMap: (url: string) => void;
}
