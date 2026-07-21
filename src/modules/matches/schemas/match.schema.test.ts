import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';
import {
  eventsResponse,
  matchesResponse,
  rulesetsResponse,
  scoreboardResponse,
} from '@/tests/msw/matches.fixture';
import { MOCK_MATCHES } from '@/tests/msw/matches-ids.fixture';

import {
  matchEventListResponseSchema,
  matchEventResponseSchema,
  matchListResponseSchema,
  matchOperationResponseSchema,
  matchResponseSchema,
  matchRulesetListResponseSchema,
  matchScoreboardResponseSchema,
  matchTimeoutStateSchema,
} from './match.schema';

describe('match schemas', () => {
  it('parses the wire the mock and the remote API both send', () => {
    expect(safeParseWithSchema(matchListResponseSchema, matchesResponse()).success).toBe(true);
    expect(safeParseWithSchema(matchResponseSchema, matchesResponse().items[0]).success).toBe(true);
    expect(
      safeParseWithSchema(
        matchScoreboardResponseSchema,
        scoreboardResponse(MOCK_MATCHES.liveMatchId),
      ).success,
    ).toBe(true);
    expect(
      safeParseWithSchema(matchEventListResponseSchema, eventsResponse(MOCK_MATCHES.liveMatchId))
        .success,
    ).toBe(true);
    expect(safeParseWithSchema(matchRulesetListResponseSchema, rulesetsResponse()).success).toBe(
      true,
    );
    expect(
      safeParseWithSchema(matchTimeoutStateSchema, {
        allowance: 2,
        usedByUs: 1,
        usedByThem: 0,
        remainingForUs: 1,
        remainingForThem: 2,
      }).success,
    ).toBe(true);
  });

  it('parses each idempotent outcome the contract defines', () => {
    const event = eventsResponse(MOCK_MATCHES.liveMatchId).items[0];
    for (const outcome of ['applied', 'replayed', 'conflict']) {
      const parsed = safeParseWithSchema(matchOperationResponseSchema, {
        outcome,
        event,
        streamVersion: 15,
        ourScore: 9,
        opponentScore: 6,
      });

      expect(parsed.success).toBe(true);
    }
  });

  it('rejects an outcome outside the contract', () => {
    const parsed = safeParseWithSchema(matchOperationResponseSchema, {
      outcome: 'merged',
      event: eventsResponse(MOCK_MATCHES.liveMatchId).items[0],
      streamVersion: 15,
      ourScore: 9,
      opponentScore: 6,
    });

    expect(parsed.success).toBe(false);
  });

  it('accepts a nullable cap and rejects a missing required field', () => {
    const ruleset = { ...rulesetsResponse().items[0], hardCap: null };
    expect(
      safeParseWithSchema(matchRulesetListResponseSchema, {
        items: [ruleset],
        total: 1,
        limit: 20,
        offset: 0,
      }).success,
    ).toBe(true);

    const { eventId: _dropped, ...withoutId } = eventsResponse(MOCK_MATCHES.liveMatchId).items[0]!;
    expect(safeParseWithSchema(matchEventResponseSchema, withoutId).success).toBe(false);
  });
});
