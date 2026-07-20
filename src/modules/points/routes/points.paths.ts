import { APP_PATHS } from '@/shared/config';

/** Route pattern and navigation target for the team leaderboard. */
export function leaderboardPagePath(): string {
  return APP_PATHS.leaderboard;
}

/** Route pattern and navigation target for the personal points ledger. */
export function pointsHistoryPath(): string {
  return APP_PATHS.points;
}
