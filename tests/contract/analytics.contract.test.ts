import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { assert, describe, expect, it } from 'vitest';

import {
  ANALYTICS_DIMENSIONS,
  analyticsSeriesResponseSchema,
  cohortComparisonResponseSchema,
  rebuildAnalyticsReportSchema,
} from '@/modules/analytics';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_ANALYTICS } from '@/tests/msw/analytics.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { apiUrl, authGet, authPost, loginAs, teamScopedPath } from '../setup/contract-api.helper';

const CONTRACT_PATH = fileURLToPath(new URL('../../contracts/openapi.json', import.meta.url));

function dimensionEnum(): readonly string[] {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8')) as {
    components: {
      schemas: { AnalyticsSeriesResponseDto: { properties: { dimension: { enum: string[] } } } };
    };
  };
  return contract.components.schemas.AnalyticsSeriesResponseDto.properties.dimension.enum;
}

function teamPath(suffix: string): string {
  return teamScopedPath(MOCK_ANALYTICS.teamId, suffix);
}

describe('analytics wire contract (mock mode = remote contract)', () => {
  it('serves a team series with a null-gap and its citation metadata', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath('/analytics/team/series?dimension=attendance'), token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(analyticsSeriesResponseSchema, await response.json());
    assert(parsed.success, 'series violated AnalyticsSeriesResponseDto');
    expect(parsed.data.points.some((point) => point.value === null)).toBe(true);
    expect(parsed.data.calculationVersion.length).toBeGreaterThan(0);
    expect(parsed.data.summary.length).toBeGreaterThan(0);
  });

  it('suppresses a cohort below the privacy threshold', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);
    const response = await authGet(
      teamPath(
        `/analytics/cohorts/comparison?dimension=attendance&periodKey=${MOCK_ANALYTICS.suppressedPeriodKey}`,
      ),
      token,
    );
    const parsed = safeParseWithSchema(cohortComparisonResponseSchema, await response.json());
    assert(parsed.success, 'cohort violated CohortComparisonResponseDto');
    expect(parsed.data.suppressed).toBe(true);
    expect(parsed.data.average).toBeNull();
  });

  it('exposes real stats for a cohort at or above the threshold', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);
    const response = await authGet(
      teamPath('/analytics/cohorts/comparison?dimension=attendance&periodKey=2026-04'),
      token,
    );
    const parsed = safeParseWithSchema(cohortComparisonResponseSchema, await response.json());
    assert(parsed.success, 'cohort violated CohortComparisonResponseDto');
    expect(parsed.data.suppressed).toBe(false);
    expect(parsed.data.average).not.toBeNull();
  });

  it('honors analytics.read.self for a member reading their own series (B3)', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(
      teamPath(`/analytics/players/${MOCK_ANALYTICS.ownMemberId}/series?dimension=overall`),
      token,
    );
    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(analyticsSeriesResponseSchema, await response.json());
    assert(parsed.success, 'series violated AnalyticsSeriesResponseDto');
  });

  it('forbids a member reading another member’s series (errors.analytics.forbidden)', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(
      teamPath(`/analytics/players/${MOCK_ANALYTICS.memberId}/series?dimension=overall`),
      token,
    );
    expect(response.status).toBe(403);
    const body = (await response.json()) as { messageKey?: string };
    expect(body.messageKey).toBe('errors.analytics.forbidden');
  });

  it('404s an unknown membership with the scope-not-found key', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(
      teamPath(`/analytics/players/${MOCK_ANALYTICS.unknownMemberId}/series`),
      token,
    );
    expect(response.status).toBe(404);
    const body = (await response.json()) as { messageKey?: string };
    expect(body.messageKey).toBe('errors.analytics.scopeNotFound');
  });

  it('rebuilds projections for a data-quality holder and cites its report', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.teamAdmin);
    const response = await authPost(teamPath('/analytics/rebuild'), token, {
      periodType: 'monthly',
    });
    const parsed = safeParseWithSchema(rebuildAnalyticsReportSchema, await response.json());
    assert(parsed.success, 'report violated RebuildAnalyticsReportDto');
    expect(parsed.data.subjectsProjected).toBeGreaterThanOrEqual(0);
  });

  it('forbids a rebuild for a coach lacking data_quality.manage', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authPost(teamPath('/analytics/rebuild'), token, {
      periodType: 'monthly',
    });
    expect(response.status).toBe(403);
  });

  it('pins the frontend dimension vocabulary to the OpenAPI enum', () => {
    expect([...dimensionEnum()].toSorted()).toEqual([...ANALYTICS_DIMENSIONS].toSorted());
  });

  it('rejects an anonymous series read', async () => {
    const response = await fetch(apiUrl(teamPath('/analytics/players/x/series')));
    expect(response.status).toBe(401);
  });
});
