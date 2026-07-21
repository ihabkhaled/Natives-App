import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';
import { matchStatisticsResponse } from '@/tests/msw/match-statistics.fixture';
import { MOCK_MATCHES } from '@/tests/msw/matches-ids.fixture';

import {
  matchStatisticsResponseSchema,
  playerMatchStatisticsSchema,
  teamMatchStatisticsSchema,
} from './match-statistics.schema';

const DTO = matchStatisticsResponse(MOCK_MATCHES.liveMatchId);

describe('match statistics schemas', () => {
  it('parses the projection the backend returns', () => {
    expect(safeParseWithSchema(matchStatisticsResponseSchema, DTO).success).toBe(true);
    expect(safeParseWithSchema(teamMatchStatisticsSchema, DTO.team).success).toBe(true);
  });

  it('accepts a fully null per-player line, which means "not enough data"', () => {
    const unmeasured = DTO.players.find(
      (player) => player.membershipId === MOCK_MATCHES.unmeasuredMembershipId,
    );

    expect(safeParseWithSchema(playerMatchStatisticsSchema, unmeasured).success).toBe(true);
  });

  it('rejects a player row without a membership', () => {
    const { membershipId: _dropped, ...withoutId } = DTO.players[0]!;

    expect(safeParseWithSchema(playerMatchStatisticsSchema, withoutId).success).toBe(false);
  });

  it('rejects a non-integer measure', () => {
    expect(
      safeParseWithSchema(playerMatchStatisticsSchema, { ...DTO.players[0], goals: 1.5 }).success,
    ).toBe(false);
  });
});
