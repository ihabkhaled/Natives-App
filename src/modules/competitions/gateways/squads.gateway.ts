import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  squadAvailabilityPath,
  squadEligibilityPath,
  squadPath,
  squadSelectionOverridePath,
  squadSelectionRemovalPath,
  squadSelectionsPath,
  squadTransitionPath,
  squadsPath,
} from '../constants/competitions-api.constants';
import { CANDIDATE_PARAMS, PAGE_PARAMS } from '../constants/competitions.constants';
import {
  availabilityListResponseSchema,
  availabilityResponseSchema,
  eligibilityReportResponseSchema,
  selectionListResponseSchema,
  selectionResponseSchema,
  squadListResponseSchema,
  squadResponseSchema,
} from '../schemas/squad.schema';
import type {
  DeclareAvailabilityCommand,
  OverrideSelectPlayerCommand,
  SelectPlayerCommand,
  TransitionSquadCommand,
} from '../types/competitions.types';

type SquadListDto = SchemaOutput<typeof squadListResponseSchema>;
type SquadDto = SchemaOutput<typeof squadResponseSchema>;
type EligibilityDto = SchemaOutput<typeof eligibilityReportResponseSchema>;
type SelectionListDto = SchemaOutput<typeof selectionListResponseSchema>;
type SelectionDto = SchemaOutput<typeof selectionResponseSchema>;
type AvailabilityListDto = SchemaOutput<typeof availabilityListResponseSchema>;
type AvailabilityDto = SchemaOutput<typeof availabilityResponseSchema>;

export function requestSquads(teamId: string): Promise<SquadListDto> {
  return getAppHttpClient().get(squadsPath(teamId), squadListResponseSchema, {
    params: PAGE_PARAMS,
  });
}

export function requestSquad(teamId: string, squadId: string): Promise<SquadDto> {
  return getAppHttpClient().get(squadPath(teamId, squadId), squadResponseSchema);
}

/** The advisory eligibility report the coach reads before selecting. */
export function requestSquadEligibility(teamId: string, squadId: string): Promise<EligibilityDto> {
  return getAppHttpClient().get(
    squadEligibilityPath(teamId, squadId),
    eligibilityReportResponseSchema,
    { params: CANDIDATE_PARAMS },
  );
}

export function requestSquadSelections(teamId: string, squadId: string): Promise<SelectionListDto> {
  return getAppHttpClient().get(squadSelectionsPath(teamId, squadId), selectionListResponseSchema, {
    params: CANDIDATE_PARAMS,
  });
}

export function requestSquadAvailability(
  teamId: string,
  squadId: string,
): Promise<AvailabilityListDto> {
  return getAppHttpClient().get(
    squadAvailabilityPath(teamId, squadId),
    availabilityListResponseSchema,
    { params: CANDIDATE_PARAMS },
  );
}

export function requestSelectPlayer(
  teamId: string,
  squadId: string,
  command: SelectPlayerCommand,
): Promise<SelectionDto> {
  return getAppHttpClient().post(
    squadSelectionsPath(teamId, squadId),
    {
      membershipId: command.membershipId,
      selectionRole: command.selectionRole,
      reason: command.reason,
    },
    selectionResponseSchema,
  );
}

/** Selecting past the policy: the reason is mandatory and is stored server-side. */
export function requestOverrideSelectPlayer(
  teamId: string,
  squadId: string,
  command: OverrideSelectPlayerCommand,
): Promise<SelectionDto> {
  return getAppHttpClient().post(
    squadSelectionOverridePath(teamId, squadId),
    {
      membershipId: command.membershipId,
      selectionRole: command.selectionRole,
      reason: command.reason,
      overrideReason: command.overrideReason,
    },
    selectionResponseSchema,
  );
}

export function requestRemoveSelection(
  teamId: string,
  squadId: string,
  membershipId: string,
): Promise<SelectionDto> {
  return getAppHttpClient().post(
    squadSelectionRemovalPath(teamId, squadId, membershipId),
    { reason: null },
    selectionResponseSchema,
  );
}

export function requestDeclareAvailability(
  teamId: string,
  squadId: string,
  command: DeclareAvailabilityCommand,
): Promise<AvailabilityDto> {
  return getAppHttpClient().post(
    squadAvailabilityPath(teamId, squadId),
    { availability: command.availability, reason: command.reason },
    availabilityResponseSchema,
  );
}

export function requestTransitionSquad(
  teamId: string,
  squadId: string,
  command: TransitionSquadCommand,
): Promise<SquadDto> {
  return getAppHttpClient().post(
    squadTransitionPath(teamId, squadId),
    { transition: command.transition, expectedRecordVersion: command.expectedRecordVersion },
    squadResponseSchema,
  );
}
