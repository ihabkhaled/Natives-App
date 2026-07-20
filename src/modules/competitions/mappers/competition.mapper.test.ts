import { describe, expect, it } from 'vitest';

import {
  competitionFixturesResponse,
  competitionResponse,
  competitionStructureResponse,
  competitionsResponse,
  MOCK_COMPETITIONS,
  opponentsResponse,
} from '@/tests/msw/competitions.fixture';

import {
  mapCompetition,
  mapCompetitionPage,
  mapCompetitionStructure,
  mapFixturePage,
  mapOpponentPage,
} from './competition.mapper';

describe('mapCompetition', () => {
  it('keeps every nullable field null rather than defaulting it', () => {
    const draft = mapCompetition(competitionResponse(MOCK_COMPETITIONS.championshipId)!);

    expect(draft.startsOn).toBeNull();
    expect(draft.endsOn).toBeNull();
    expect(draft.organizerName).toBeNull();
    expect(draft.description).toBeNull();
  });

  it('carries the cancellation reason of a cancelled competition', () => {
    const cancelled = mapCompetition(competitionResponse(MOCK_COMPETITIONS.cancelledId)!);

    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.cancellationReason).toBe('Venue withdrew the pitch booking.');
  });

  it('maps a full page without losing its total', () => {
    const page = mapCompetitionPage(competitionsResponse());

    expect(page.items).toHaveLength(page.total);
  });
});

describe('mapCompetitionStructure', () => {
  it('sorts stages and rounds into playing order', () => {
    const structure = mapCompetitionStructure(
      competitionStructureResponse(MOCK_COMPETITIONS.leagueId),
    );

    expect(structure.stages.map((stage) => stage.ordinal)).toEqual([1, 2]);
    expect(structure.rounds.map((round) => round.ordinal)).toEqual([1, 2]);
  });

  it('handles a competition with no published structure', () => {
    expect(mapCompetitionStructure(competitionStructureResponse('unknown'))).toEqual({
      stages: [],
      rounds: [],
    });
  });
});

describe('mapFixturePage and mapOpponentPage', () => {
  it('keeps a fixture reschedule trail and its unassigned venue', () => {
    const page = mapFixturePage(competitionFixturesResponse(MOCK_COMPETITIONS.leagueId));
    const rescheduled = page.items[1]!;

    expect(rescheduled.rescheduleCount).toBe(1);
    expect(rescheduled.rescheduleReason).toBe('Opponent travel delay');
    expect(rescheduled.venueId).toBeNull();
  });

  it('drops opponent contact fields entirely', () => {
    const page = mapOpponentPage(opponentsResponse());

    expect(page.items).toHaveLength(page.total);
    expect(Object.keys(page.items[0]!)).toEqual([
      'opponentId',
      'name',
      'shortName',
      'notes',
      'status',
    ]);
  });
});
