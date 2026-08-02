import type {
  PublicLeaderboardLabels,
  PublicLeaderboardRowView,
} from '../../types/public-competitions-view.types';

export interface PublicLeaderboardTableProps {
  readonly labels: PublicLeaderboardLabels;
  readonly rows: readonly PublicLeaderboardRowView[];
}
