import { APP_PATHS } from '@/shared/config';

import { COMPETITION_SLUG_PARAM } from '../constants/public-showcase.constants';

/** Route pattern and navigation target for the public competition list. */
export function publicCompetitionsPath(): string {
  return APP_PATHS.publicCompetitions;
}

/** Route pattern for one public competition page. */
export function publicCompetitionDetailPattern(): string {
  return APP_PATHS.publicCompetitionDetail;
}

/** Navigation target for one public competition page. */
export function publicCompetitionDetailPath(slug: string): string {
  return APP_PATHS.publicCompetitionDetail.replace(
    `:${COMPETITION_SLUG_PARAM}`,
    encodeURIComponent(slug),
  );
}
