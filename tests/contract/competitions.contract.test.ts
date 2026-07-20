import { assert, describe, expect, it } from 'vitest';

import {
  availabilityListResponseSchema,
  competitionListResponseSchema,
  competitionResponseSchema,
  competitionStructureResponseSchema,
  eligibilityReportResponseSchema,
  rosterEntryListResponseSchema,
  rosterListResponseSchema,
  rosterResponseSchema,
  rosterSnapshotListResponseSchema,
  rosterValidationResponseSchema,
  fixtureListResponseSchema,
  opponentListResponseSchema,
  selectionListResponseSchema,
  selectionResponseSchema,
  squadListResponseSchema,
  squadResponseSchema,
} from '@/modules/competitions';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_COMPETITIONS } from '@/tests/msw/competitions.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_ROSTERS } from '@/tests/msw/rosters.fixture';
import { MOCK_SQUADS } from '@/tests/msw/squads.fixture';

import { authGet, authPost, loginAs, teamScopedPath } from '../setup/contract-api.helper';

function teamPath(suffix: string): string {
  return teamScopedPath(MOCK_COMPETITIONS.teamId, suffix);
}

describe('competitions wire contract (mock mode = remote contract)', () => {
  it('serves a bounded competition page', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/competitions?limit=50&offset=0'), token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(competitionListResponseSchema, await response.json());
    assert(parsed.success, 'list violated ListCompetitionsResponseDto');
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('serves one competition with its nullable dates intact', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(
      teamPath(`/competitions/${MOCK_COMPETITIONS.championshipId}`),
      token,
    );

    const parsed = safeParseWithSchema(competitionResponseSchema, await response.json());
    assert(parsed.success, 'detail violated CompetitionResponseDto');
    expect(parsed.data.startsOn).toBeNull();
    expect(parsed.data.endsOn).toBeNull();
  });

  it('serves the published stage and round structure', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(
      teamPath(`/competitions/${MOCK_COMPETITIONS.leagueId}/structure`),
      token,
    );

    const parsed = safeParseWithSchema(competitionStructureResponseSchema, await response.json());
    assert(parsed.success, 'structure violated StructureResponseDto');
    expect(parsed.data.stages.length).toBe(2);
  });

  it('serves fixtures carrying both the UTC instant and its Cairo wall clock', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(
      teamPath(`/competitions/${MOCK_COMPETITIONS.leagueId}/fixtures`),
      token,
    );

    const parsed = safeParseWithSchema(fixtureListResponseSchema, await response.json());
    assert(parsed.success, 'fixtures violated ListFixturesResponseDto');
    expect(parsed.data.items[0]?.timezone).toBe('Africa/Cairo');
    expect(parsed.data.items[0]?.scheduledAt.endsWith('Z')).toBe(true);
  });

  it('serves the opponent directory', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/opponents'), token);

    const parsed = safeParseWithSchema(opponentListResponseSchema, await response.json());
    assert(parsed.success, 'opponents violated ListOpponentsResponseDto');
    expect(parsed.data.items.some((item) => item.status === 'archived')).toBe(true);
  });

  it('rejects an unauthenticated competition read', async () => {
    const response = await authGet(teamPath('/competitions'), '');

    expect(response.status).toBe(401);
  });
});

describe('squads wire contract (mock mode = remote contract)', () => {
  it('serves a bounded squad page', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath('/squads?limit=50&offset=0'), token);

    const parsed = safeParseWithSchema(squadListResponseSchema, await response.json());
    assert(parsed.success, 'list violated ListSquadsResponseDto');
    expect(parsed.data.items.length).toBe(3);
  });

  it('serves one squad with its policy version and record token', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath(`/squads/${MOCK_SQUADS.draftId}`), token);

    const parsed = safeParseWithSchema(squadResponseSchema, await response.json());
    assert(parsed.success, 'detail violated SquadResponseDto');
    expect(parsed.data.policyVersion).toBe('squad-policy-v3');
    expect(parsed.data.recordVersion).toBeGreaterThan(0);
  });

  it('serves an eligibility report whose unknown attendance stays null', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath(`/squads/${MOCK_SQUADS.draftId}/eligibility`), token);

    const parsed = safeParseWithSchema(eligibilityReportResponseSchema, await response.json());
    assert(parsed.success, 'report violated EligibilityReportResponseDto');
    const unknown = parsed.data.candidates.find(
      (candidate) => candidate.membershipId === MOCK_SQUADS.unknownMembershipId,
    );
    expect(unknown?.attendancePct).toBeNull();
    expect(unknown?.availability).toBeNull();
  });

  it('serves the selection list and the availability list', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const selections = await authGet(teamPath(`/squads/${MOCK_SQUADS.draftId}/selections`), token);
    const availability = await authGet(
      teamPath(`/squads/${MOCK_SQUADS.draftId}/availability`),
      token,
    );

    const parsedSelections = safeParseWithSchema(
      selectionListResponseSchema,
      await selections.json(),
    );
    const parsedAvailability = safeParseWithSchema(
      availabilityListResponseSchema,
      await availability.json(),
    );
    assert(parsedSelections.success, 'selections violated ListSelectionsResponseDto');
    assert(parsedAvailability.success, 'availability violated ListAvailabilityResponseDto');
  });

  it('records an override selection with its mandatory reason', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authPost(
      teamPath(`/squads/${MOCK_SQUADS.draftId}/selections/override`),
      token,
      {
        membershipId: MOCK_SQUADS.failedMembershipId,
        selectionRole: 'player',
        reason: null,
        overrideReason: 'Needed for handler depth.',
      },
    );
    expect(response.status).toBe(201);

    const parsed = safeParseWithSchema(selectionResponseSchema, await response.json());
    assert(parsed.success, 'override violated SelectionResponseDto');
    expect(parsed.data.eligibilityOverridden).toBe(true);
    expect(parsed.data.overrideReason).toBe('Needed for handler depth.');
  });

  it('rejects an override with no reason at all', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authPost(
      teamPath(`/squads/${MOCK_SQUADS.draftId}/selections/override`),
      token,
      { membershipId: MOCK_SQUADS.failedMembershipId, overrideReason: '' },
    );

    expect(response.status).toBe(400);
  });

  it('rejects a squad transition that carries a stale record version', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authPost(teamPath(`/squads/${MOCK_SQUADS.draftId}/transition`), token, {
      transition: 'publish',
      expectedRecordVersion: 99,
    });

    expect(response.status).toBe(409);
  });
});

describe('rosters wire contract (mock mode = remote contract)', () => {
  it('serves a bounded roster page covering both roster kinds', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath('/rosters?limit=50&offset=0'), token);

    const parsed = safeParseWithSchema(rosterListResponseSchema, await response.json());
    assert(parsed.success, 'list violated ListRostersResponseDto');
    expect(parsed.data.items.some((item) => item.rosterKind === 'match')).toBe(true);
  });

  it('serves one roster with its size policy intact', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath(`/rosters/${MOCK_ROSTERS.competitionRosterId}`), token);

    const parsed = safeParseWithSchema(rosterResponseSchema, await response.json());
    assert(parsed.success, 'detail violated RosterResponseDto');
    expect(parsed.data.minSize).toBe(12);
    expect(parsed.data.requireCaptain).toBe(true);
  });

  it('keeps a rostered player without a jersey null on the wire', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(
      teamPath(`/rosters/${MOCK_ROSTERS.competitionRosterId}/entries`),
      token,
    );

    const parsed = safeParseWithSchema(rosterEntryListResponseSchema, await response.json());
    assert(parsed.success, 'entries violated ListRosterEntriesResponseDto');
    expect(parsed.data.items.some((item) => item.jerseyNumber === null)).toBe(true);
    expect(parsed.data.items.some((item) => item.availability === null)).toBe(true);
  });

  it('serves the server-side validation verdict with its violations', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(
      teamPath(`/rosters/${MOCK_ROSTERS.competitionRosterId}/validation`),
      token,
    );

    const parsed = safeParseWithSchema(rosterValidationResponseSchema, await response.json());
    assert(parsed.success, 'validation violated RosterValidationResponseDto');
    expect(parsed.data.publishable).toBe(false);
    expect(parsed.data.violations.some((item) => item.code === 'min_size')).toBe(true);
  });

  it('serves the append-only snapshot history', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(
      teamPath(`/rosters/${MOCK_ROSTERS.lockedRosterId}/snapshots`),
      token,
    );

    const parsed = safeParseWithSchema(rosterSnapshotListResponseSchema, await response.json());
    assert(parsed.success, 'snapshots violated ListRosterSnapshotsResponseDto');
    expect(parsed.data.items[0]?.reason).toBe('locked');
  });

  it('rejects a roster lock that carries a stale record version', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authPost(
      teamPath(`/rosters/${MOCK_ROSTERS.matchRosterId}/lock`),
      token,
      { expectedRecordVersion: 99 },
    );

    expect(response.status).toBe(409);
  });
});
