import { getCompetition } from '../services/get-competition.service';
import { getRoster } from '../services/get-roster.service';
import { getRosterValidation } from '../services/get-roster-validation.service';
import { getCompetitionStructure } from '../services/get-competition-structure.service';
import { getSquad } from '../services/get-squad.service';
import { getSquadEligibility } from '../services/get-squad-eligibility.service';
import { listCompetitions } from '../services/list-competitions.service';
import { listFixtures } from '../services/list-fixtures.service';
import { listOpponents } from '../services/list-opponents.service';
import { listRosterEntries } from '../services/list-roster-entries.service';
import { listRosterSnapshots } from '../services/list-roster-snapshots.service';
import { listRosters } from '../services/list-rosters.service';
import { listSquadAvailability } from '../services/list-squad-availability.service';
import { listSquadSelections } from '../services/list-squad-selections.service';
import { listSquads } from '../services/list-squads.service';
import { competitionsQueryKeys } from './competitions.keys';

/** Every read is disabled until a real team scope (and id) is resolved. */
function scoped(teamId: string, resourceId = 'present'): boolean {
  return teamId !== '' && resourceId !== '';
}

export function buildCompetitionsQueryOptions(teamId: string) {
  return {
    queryKey: competitionsQueryKeys.list(teamId),
    queryFn: () => listCompetitions(teamId),
    enabled: scoped(teamId),
  };
}

export function buildCompetitionQueryOptions(teamId: string, competitionId: string) {
  return {
    queryKey: competitionsQueryKeys.detail(teamId, competitionId),
    queryFn: () => getCompetition(teamId, competitionId),
    enabled: scoped(teamId, competitionId),
  };
}

export function buildCompetitionStructureQueryOptions(teamId: string, competitionId: string) {
  return {
    queryKey: competitionsQueryKeys.structure(teamId, competitionId),
    queryFn: () => getCompetitionStructure(teamId, competitionId),
    enabled: scoped(teamId, competitionId),
  };
}

export function buildCompetitionFixturesQueryOptions(teamId: string, competitionId: string) {
  return {
    queryKey: competitionsQueryKeys.fixtures(teamId, competitionId),
    queryFn: () => listFixtures(teamId, competitionId),
    enabled: scoped(teamId, competitionId),
  };
}

export function buildOpponentsQueryOptions(teamId: string) {
  return {
    queryKey: competitionsQueryKeys.opponents(teamId),
    queryFn: () => listOpponents(teamId),
    enabled: scoped(teamId),
  };
}

export function buildSquadsQueryOptions(teamId: string) {
  return {
    queryKey: competitionsQueryKeys.squads(teamId),
    queryFn: () => listSquads(teamId),
    enabled: scoped(teamId),
  };
}

export function buildSquadQueryOptions(teamId: string, squadId: string) {
  return {
    queryKey: competitionsQueryKeys.squad(teamId, squadId),
    queryFn: () => getSquad(teamId, squadId),
    enabled: scoped(teamId, squadId),
  };
}

export function buildSquadEligibilityQueryOptions(teamId: string, squadId: string) {
  return {
    queryKey: competitionsQueryKeys.eligibility(teamId, squadId),
    queryFn: () => getSquadEligibility(teamId, squadId),
    enabled: scoped(teamId, squadId),
  };
}

export function buildSquadSelectionsQueryOptions(teamId: string, squadId: string) {
  return {
    queryKey: competitionsQueryKeys.selections(teamId, squadId),
    queryFn: () => listSquadSelections(teamId, squadId),
    enabled: scoped(teamId, squadId),
  };
}

export function buildSquadAvailabilityQueryOptions(teamId: string, squadId: string) {
  return {
    queryKey: competitionsQueryKeys.availability(teamId, squadId),
    queryFn: () => listSquadAvailability(teamId, squadId),
    enabled: scoped(teamId, squadId),
  };
}

export function buildRostersQueryOptions(teamId: string) {
  return {
    queryKey: competitionsQueryKeys.rosters(teamId),
    queryFn: () => listRosters(teamId),
    enabled: scoped(teamId),
  };
}

export function buildRosterQueryOptions(teamId: string, rosterId: string) {
  return {
    queryKey: competitionsQueryKeys.roster(teamId, rosterId),
    queryFn: () => getRoster(teamId, rosterId),
    enabled: scoped(teamId, rosterId),
  };
}

export function buildRosterEntriesQueryOptions(teamId: string, rosterId: string) {
  return {
    queryKey: competitionsQueryKeys.rosterEntries(teamId, rosterId),
    queryFn: () => listRosterEntries(teamId, rosterId),
    enabled: scoped(teamId, rosterId),
  };
}

export function buildRosterValidationQueryOptions(teamId: string, rosterId: string) {
  return {
    queryKey: competitionsQueryKeys.rosterValidation(teamId, rosterId),
    queryFn: () => getRosterValidation(teamId, rosterId),
    enabled: scoped(teamId, rosterId),
  };
}

export function buildRosterSnapshotsQueryOptions(teamId: string, rosterId: string) {
  return {
    queryKey: competitionsQueryKeys.rosterSnapshots(teamId, rosterId),
    queryFn: () => listRosterSnapshots(teamId, rosterId),
    enabled: scoped(teamId, rosterId),
  };
}
