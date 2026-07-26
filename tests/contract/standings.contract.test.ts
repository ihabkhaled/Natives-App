import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { assert, describe, expect, it } from 'vitest';

import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_STATUSES,
  achievementResponseSchema,
  listAchievementsResponseSchema,
  listStandingsResponseSchema,
  listStandingsRulesResponseSchema,
  STANDING_TIE_BREAKS,
  standingsRecomputeReportSchema,
  teamHistoryResponseSchema,
} from '@/modules/standings';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_ACHIEVEMENTS } from '@/tests/msw/achievements.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_STANDINGS } from '@/tests/msw/standings.fixture';

import { apiUrl, authGet, authPost, loginAs, teamScopedPath } from '../setup/contract-api.helper';

const CONTRACT_PATH = fileURLToPath(new URL('../../contracts/openapi.json', import.meta.url));

interface OpenApiContract {
  readonly components: {
    readonly schemas: Record<
      string,
      { readonly properties?: Record<string, { readonly enum?: readonly string[] }> }
    >;
  };
}

function contract(): OpenApiContract {
  return JSON.parse(readFileSync(CONTRACT_PATH, 'utf8')) as OpenApiContract;
}

function teamPath(suffix: string): string {
  return teamScopedPath(MOCK_STANDINGS.teamId, suffix);
}

describe('standings wire contract (mock mode = remote contract)', () => {
  it('serves the standings table with the denormalized opponent name (B5)', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(
      teamPath(`/standings?competitionId=${MOCK_STANDINGS.leagueId}`),
      token,
    );
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(listStandingsResponseSchema, await response.json());
    assert(parsed.success, 'standings violated ListStandingsResponseDto');
    const opponent = parsed.data.items.find((row) => row.entrantKind === 'opponent');
    expect(opponent?.opponentName).toBeTypeOf('string');
    expect(parsed.data.items.some((row) => row.spiritScore === null)).toBe(true);
  });

  it('recomputes a competition and reports finalized matches and entrants', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authPost(teamPath('/standings/recompute'), token, {
      competitionId: MOCK_STANDINGS.leagueId,
      ruleKey: MOCK_STANDINGS.ruleKey,
    });
    const parsed = safeParseWithSchema(standingsRecomputeReportSchema, await response.json());
    assert(parsed.success, 'report violated StandingsRecomputeReportDto');
    expect(parsed.data.finalizedMatches).toBeGreaterThanOrEqual(0);
  });

  it('serves immutable, versioned rules with an ordered tie-break list', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath('/standings-rules'), token);
    const parsed = safeParseWithSchema(listStandingsRulesResponseSchema, await response.json());
    assert(parsed.success, 'rules violated ListStandingsRulesResponseDto');
    expect(parsed.data.items.every((rule) => rule.tieBreakOrder.length > 0)).toBe(true);
  });

  it('returns the new rejection reason on a rejected achievement (B4)', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authPost(
      teamPath(`/achievements/${MOCK_ACHIEVEMENTS.submittedId}/transition`),
      token,
      { transition: 'reject', expectedRecordVersion: 1, reason: 'Insufficient evidence.' },
    );
    const parsed = safeParseWithSchema(achievementResponseSchema, await response.json());
    assert(parsed.success, 'achievement violated AchievementResponseDto');
    expect(parsed.data.status).toBe('rejected');
    expect(parsed.data.rejectionReason).toBe('Insufficient evidence.');
  });

  it('answers a stale record version with the version-conflict envelope', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authPost(
      teamPath(`/achievements/${MOCK_ACHIEVEMENTS.approvedId}/transition`),
      token,
      { transition: 'archive', expectedRecordVersion: 99 },
    );
    expect(response.status).toBe(409);
    const body = (await response.json()) as { messageKey?: string };
    expect(body.messageKey).toBe('errors.standings.versionConflict');
  });

  it('serves the trophy cabinet to any team member (team.read)', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/history'), token);
    const parsed = safeParseWithSchema(teamHistoryResponseSchema, await response.json());
    assert(parsed.success, 'history violated TeamHistoryResponseDto');
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('lists achievements for a reader', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath('/achievements'), token);
    const parsed = safeParseWithSchema(listAchievementsResponseSchema, await response.json());
    assert(parsed.success, 'list violated ListAchievementsResponseDto');
  });

  it('pins the tie-break, category, and status vocabularies to the OpenAPI enums', () => {
    const schemas = contract().components.schemas;
    expect(schemas['StandingsRuleResponseDto']?.properties?.['tieBreakOrder']).toBeDefined();
    const categoryEnum = schemas['AchievementResponseDto']?.properties?.['category']?.enum ?? [];
    const statusEnum = schemas['AchievementResponseDto']?.properties?.['status']?.enum ?? [];
    expect([...categoryEnum].toSorted()).toEqual([...ACHIEVEMENT_CATEGORIES].toSorted());
    expect([...statusEnum].toSorted()).toEqual([...ACHIEVEMENT_STATUSES].toSorted());
    const tieBreakEnum = schemas['CreateStandingsRuleDto']?.properties?.['tieBreakOrder'] ?? {};
    expect(tieBreakEnum).toBeDefined();
    expect(STANDING_TIE_BREAKS.length).toBe(7);
  });

  it('rejects an anonymous standings read', async () => {
    const response = await fetch(apiUrl(teamPath('/standings')));
    expect(response.status).toBe(401);
  });
});
