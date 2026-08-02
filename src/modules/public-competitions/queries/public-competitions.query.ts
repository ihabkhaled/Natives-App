import { getPublicCompetition } from '../services/get-public-competition.service';
import { listPublicCompetitions } from '../services/list-public-competitions.service';
import type {
  PublicCompetitionDetailDto,
  PublicCompetitionSummaryDto,
} from '../types/public-showcase.types';
import { publicCompetitionsQueryKeys } from './public-competitions.keys';

interface PublicCompetitionsListQueryOptions {
  readonly queryKey: readonly string[];
  readonly queryFn: () => Promise<readonly PublicCompetitionSummaryDto[]>;
}

interface PublicCompetitionDetailQueryOptions {
  readonly queryKey: readonly string[];
  readonly queryFn: () => Promise<PublicCompetitionDetailDto | null>;
  readonly enabled: boolean;
}

/** Query options for the public competition list. */
export function buildPublicCompetitionsQueryOptions(): PublicCompetitionsListQueryOptions {
  return {
    queryKey: publicCompetitionsQueryKeys.list(),
    queryFn: () => listPublicCompetitions(),
  };
}

/** Query options for one public competition page, keyed by its slug. */
export function buildPublicCompetitionQueryOptions(
  slug: string,
): PublicCompetitionDetailQueryOptions {
  return {
    queryKey: publicCompetitionsQueryKeys.detail(slug),
    queryFn: () => getPublicCompetition(slug),
    enabled: slug !== '',
  };
}
