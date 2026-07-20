import { assert, describe, expect, it } from 'vitest';

import { leaderboardResponseSchema, pointsSummaryResponseSchema } from '@/modules/points';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_PERSONA_EMAILS, MOCK_PRACTICE } from '@/tests/msw/mock-data.constants';

import { apiUrl, authGet, loginAs, teamScopedPath } from '../setup/contract-api.helper';

function teamPath(suffix: string): string {
  return teamScopedPath(MOCK_PRACTICE.teamId, suffix);
}

describe('points wire contract (mock mode = remote contract)', () => {
  it('serves the leaderboard with its tie mode and freshness instant', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/points?period=season&cohort=all'), token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(leaderboardResponseSchema, await response.json());
    assert(parsed.success, 'leaderboard violated LeaderboardResponseDto');
    expect(parsed.data.tieMode).toBe('competition');
    expect(parsed.data.period).toBe('season');
  });

  it('keeps a zero-total member in the envelope rather than filtering them out', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/points'), token);

    const parsed = safeParseWithSchema(leaderboardResponseSchema, await response.json());
    assert(parsed.success, 'leaderboard violated LeaderboardResponseDto');
    expect(parsed.data.items.some((row) => row.total === 0)).toBe(true);
  });

  it('reports an unknown previous rank as null, never as zero', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/points'), token);

    const parsed = safeParseWithSchema(leaderboardResponseSchema, await response.json());
    assert(parsed.success, 'leaderboard violated LeaderboardResponseDto');
    const newcomer = parsed.data.items.find((row) => row.movement === 'none');
    expect(newcomer?.previousRank).toBeNull();
    expect(newcomer?.rankDelta).toBeNull();
  });

  it('serves the caller ledger with awards, reversals, and adjustments apart', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/my-points'), token);

    const parsed = safeParseWithSchema(pointsSummaryResponseSchema, await response.json());
    assert(parsed.success, 'summary violated PointsSummaryResponseDto');
    const kinds = new Set(parsed.data.entries.map((entry) => entry.entryType));
    expect(kinds.has('award')).toBe(true);
    expect(kinds.has('reversal')).toBe(true);
    expect(kinds.has('manual_adjustment')).toBe(true);
  });

  it('never publishes the unresolved legacy badge tier', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/my-points'), token);

    const parsed = safeParseWithSchema(pointsSummaryResponseSchema, await response.json());
    assert(parsed.success, 'summary violated PointsSummaryResponseDto');
    expect(parsed.data.badges.some((badge) => badge.threshold === 649)).toBe(false);
  });

  it('rejects an anonymous read with the NestJS error envelope', async () => {
    const response = await fetch(apiUrl(teamPath('/points')));

    expect(response.status).toBe(401);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe('UNAUTHORIZED');
  });
});
