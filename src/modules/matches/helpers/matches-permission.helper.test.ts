import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import {
  canFinalizeMatch,
  canReadMatchAnalysis,
  canReadMatchStatistics,
  canReadMatches,
  canScoreMatch,
} from './matches-permission.helper';

describe('matches permission helpers', () => {
  it('gates reading on match.read', () => {
    expect(canReadMatches([PERMISSIONS.matchRead])).toBe(true);
    expect(canReadMatches([])).toBe(false);
  });

  it('gates scoring on match.score', () => {
    expect(canScoreMatch([PERMISSIONS.matchScore])).toBe(true);
    expect(canScoreMatch([PERMISSIONS.matchRead])).toBe(false);
  });

  it('gates finalizing on its own grant, above plain scoring', () => {
    expect(canFinalizeMatch([PERMISSIONS.matchScore])).toBe(false);
    expect(canFinalizeMatch([PERMISSIONS.matchFinalize])).toBe(true);
  });

  it('gates statistics on match.stats.read', () => {
    expect(canReadMatchStatistics([PERMISSIONS.matchStatsRead])).toBe(true);
    expect(canReadMatchStatistics([PERMISSIONS.matchRead])).toBe(false);
  });

  it('accepts either analysis grant', () => {
    expect(canReadMatchAnalysis([PERMISSIONS.matchAnalysisReadTeam])).toBe(true);
    expect(canReadMatchAnalysis([PERMISSIONS.matchAnalysisReadSelf])).toBe(true);
    expect(canReadMatchAnalysis([PERMISSIONS.matchRead])).toBe(false);
  });
});
