import type { BadgeCandidateView, BadgeView } from '../../types/points-view.types';

export interface PointsBadgeListProps {
  readonly badges: readonly BadgeView[];
  readonly emptyLabel: string;
  readonly heading: string;
  readonly intro: string;
  readonly candidateHeading: string;
  readonly candidateIntro: string;
  readonly candidates: readonly BadgeCandidateView[];
}
