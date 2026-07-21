import { describe, expect, it } from 'vitest';

import { matchStatisticsResponse } from '@/tests/msw/match-statistics.fixture';
import { MOCK_MATCHES } from '@/tests/msw/matches-ids.fixture';

import { mapMatchStatistics, mapPlayerMatchStatistics } from './match-statistics.mapper';

const DTO = matchStatisticsResponse(MOCK_MATCHES.liveMatchId);

describe('mapPlayerMatchStatistics', () => {
  it('keeps a measured zero as 0', () => {
    const zeroPlayer = DTO.players.find(
      (player) => player.membershipId === MOCK_MATCHES.zeroContributionMembershipId,
    )!;

    expect(mapPlayerMatchStatistics(zeroPlayer).goals).toBe(0);
    expect(mapPlayerMatchStatistics(zeroPlayer).rostered).toBe(true);
  });

  it('keeps an unmeasured value as null rather than inventing a zero', () => {
    const unmeasured = DTO.players.find(
      (player) => player.membershipId === MOCK_MATCHES.unmeasuredMembershipId,
    )!;
    const mapped = mapPlayerMatchStatistics(unmeasured);

    expect(mapped.pointsPlayed).toBeNull();
    expect(mapped.goals).toBeNull();
    expect(mapped.blocks).toBeNull();
  });
});

describe('mapMatchStatistics', () => {
  it('carries every rostered player through, including the all-zero line', () => {
    const statistics = mapMatchStatistics(DTO);

    expect(statistics.players).toHaveLength(4);
    expect(
      statistics.players.some(
        (player) => player.membershipId === MOCK_MATCHES.zeroContributionMembershipId,
      ),
    ).toBe(true);
  });

  it('keeps an unmeasured team measure null', () => {
    const statistics = mapMatchStatistics(DTO);

    expect(statistics.team.opponentErrors).toBeNull();
    expect(statistics.team.turnovers).toBe(8);
  });

  it('reports the engine and the completeness flags', () => {
    const statistics = mapMatchStatistics(DTO);

    expect(statistics.statsEngineVersion).toBe('stats-engine-1');
    expect(statistics.lineupsRecorded).toBe(true);
    expect(statistics.opponentErrorAttribution).toBe(false);
  });
});
