import { APP_PATHS } from '@/shared/config';

export const COMPETITION_ID_PARAM = 'competitionId';
export const SQUAD_ID_PARAM = 'squadId';

/** Route pattern and navigation target for the competition list. */
export function competitionsPath(): string {
  return APP_PATHS.competitions;
}

/** Route pattern for one competition detail screen. */
export function competitionDetailPattern(): string {
  return APP_PATHS.competitionDetail;
}

/** Navigation target for one competition detail screen. */
export function competitionDetailPath(competitionId: string): string {
  return APP_PATHS.competitionDetail.replace(
    `:${COMPETITION_ID_PARAM}`,
    encodeURIComponent(competitionId),
  );
}

/** Route pattern and navigation target for the season squad list. */
export function squadsPath(): string {
  return APP_PATHS.squads;
}

/** Route pattern for one squad workspace. */
export function squadDetailPattern(): string {
  return APP_PATHS.squadDetail;
}

/** Navigation target for one squad workspace. */
export function squadDetailPath(squadId: string): string {
  return APP_PATHS.squadDetail.replace(`:${SQUAD_ID_PARAM}`, encodeURIComponent(squadId));
}

export const ROSTER_ID_PARAM = 'rosterId';

/** Route pattern and navigation target for the roster list. */
export function rostersPath(): string {
  return APP_PATHS.rosters;
}

/** Route pattern for one roster builder. */
export function rosterDetailPattern(): string {
  return APP_PATHS.rosterDetail;
}

/** Navigation target for one roster builder. */
export function rosterDetailPath(rosterId: string): string {
  return APP_PATHS.rosterDetail.replace(`:${ROSTER_ID_PARAM}`, encodeURIComponent(rosterId));
}
