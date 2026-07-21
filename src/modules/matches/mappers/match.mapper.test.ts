import { describe, expect, it } from 'vitest';

import {
  eventsResponse,
  matchesResponse,
  rulesetsResponse,
  scoreboardResponse,
} from '@/tests/msw/matches.fixture';
import { MOCK_MATCHES } from '@/tests/msw/matches-ids.fixture';

import {
  mapMatch,
  mapMatchEvent,
  mapMatchEvents,
  mapMatchOperation,
  mapMatchPage,
  mapMatchRuleset,
  mapMatchRulesets,
  mapMatchScoreboard,
} from './match.mapper';

const MATCH_DTO = matchesResponse().items[0]!;
const SCOREBOARD_DTO = scoreboardResponse(MOCK_MATCHES.liveMatchId)!;
const EVENTS = eventsResponse(MOCK_MATCHES.liveMatchId);

describe('mapMatch', () => {
  it('carries the version tokens the offline queue depends on', () => {
    const match = mapMatch(MATCH_DTO);

    expect(match.streamVersion).toBe(MATCH_DTO.streamVersion);
    expect(match.recordVersion).toBe(MATCH_DTO.recordVersion);
    expect(match.matchId).toBe(MOCK_MATCHES.liveMatchId);
  });
});

describe('mapMatchPage', () => {
  it('maps a bounded page with its total', () => {
    const page = mapMatchPage(matchesResponse());

    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(2);
  });
});

describe('mapMatchScoreboard', () => {
  it('keeps the target and the timeout allowance the server resolved', () => {
    const board = mapMatchScoreboard(SCOREBOARD_DTO);

    expect(board.target).toBe(15);
    expect(board.timeouts).toStrictEqual({
      allowance: 2,
      remainingForUs: 1,
      remainingForThem: 2,
    });
    expect(board.scoringOpen).toBe(true);
  });
});

describe('mapMatchEvent(s)', () => {
  it('maps one event with the score it produced', () => {
    const event = mapMatchEvent(EVENTS.items[0]!);

    expect(event.ourScoreAfter).toBe(7);
    expect(event.voided).toBe(false);
  });

  it('orders the stream newest first', () => {
    const events = mapMatchEvents({ ...EVENTS, items: [...EVENTS.items] });

    expect(events.map((event) => event.sequence)).toStrictEqual([14, 13]);
  });
});

describe('mapMatchOperation', () => {
  it('carries the authoritative outcome and score', () => {
    const result = mapMatchOperation({
      outcome: 'replayed',
      streamVersion: 15,
      ourScore: 9,
      opponentScore: 6,
      event: EVENTS.items[0]!,
    });

    expect(result.outcome).toBe('replayed');
    expect(result.ourScore).toBe(9);
    expect(result.operationId).toBe(EVENTS.items[0]!.operationId);
  });
});

describe('mapMatchRuleset(s)', () => {
  it('keeps every undefined cap as null', () => {
    const ruleset = mapMatchRuleset({
      ...rulesetsResponse().items[0]!,
      hardCap: null,
      timeCapMinutes: null,
    });

    expect(ruleset.hardCap).toBeNull();
    expect(ruleset.timeCapMinutes).toBeNull();
    expect(ruleset.gameTo).toBe(15);
  });

  it('maps the published list', () => {
    expect(mapMatchRulesets(rulesetsResponse())).toHaveLength(1);
  });
});
