import { requestSquadEligibility } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapEligibilityReport } from '../mappers/squad.mapper';
import type { EligibilityReport } from '../types/competitions.types';

/**
 * Use case: the advisory eligibility report. The server owns the policy; the
 * client only presents the signals and never recomputes a verdict.
 */
export function getSquadEligibility(teamId: string, squadId: string): Promise<EligibilityReport> {
  return runRequest(async () =>
    mapEligibilityReport(await requestSquadEligibility(teamId, squadId)),
  );
}
