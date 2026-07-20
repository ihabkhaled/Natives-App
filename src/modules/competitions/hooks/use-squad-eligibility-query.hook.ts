import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildSquadEligibilityQueryOptions } from '../queries/competitions.query';
import type { EligibilityReport } from '../types/competitions.types';

/** The advisory eligibility report for one squad. */
export function useSquadEligibilityQuery(
  teamId: string,
  squadId: string,
): RemoteQueryView<EligibilityReport> {
  return toRemoteQueryView(
    useAppQuery<EligibilityReport>(buildSquadEligibilityQueryOptions(teamId, squadId)),
  );
}
