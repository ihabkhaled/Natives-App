import { assert, describe, expect, it } from 'vitest';

import {
  assessmentListResponseSchema,
  assessmentRevisionsResponseSchema,
  categoryListResponseSchema,
  developmentGoalListResponseSchema,
  feedbackAcknowledgementResponseSchema,
  metricListResponseSchema,
  periodListResponseSchema,
  playerAssessmentResponseSchema,
  publishedAssessmentListResponseSchema,
  scaleListResponseSchema,
  sharedFeedbackListResponseSchema,
  templateListResponseSchema,
} from '@/modules/assessments';
import { safeParseWithSchema } from '@/packages/schema';
import {
  MOCK_ASSESSMENT_IDS,
  MOCK_FEEDBACK_ID,
  MOCK_GOAL_IDS,
  MOCK_METRIC_IDS,
} from '@/tests/msw/assessments-data.fixture';
import { MOCK_PERSONA_EMAILS, MOCK_PRACTICE } from '@/tests/msw/mock-data.constants';

import { apiUrl, authGet, authPost, loginAs } from '../setup/contract-api.helper';

const TEAM = MOCK_PRACTICE.teamId;

function teamPath(suffix: string): string {
  return `/teams/${TEAM}${suffix}`;
}

async function authPut(path: string, token: string, body: unknown): Promise<Response> {
  return fetch(apiUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

describe('assessments wire contract (mock mode = remote contract)', () => {
  it('serves the bounded team assessment envelope', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath('/player-assessments?limit=20&offset=0'), token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(assessmentListResponseSchema, await response.json());
    assert(parsed.success, 'list violated ListPlayerAssessmentsResponseDto');
    expect(parsed.data.limit).toBe(20);
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('serves one assessment with its values, preserving null and zero', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(
      teamPath(`/player-assessments/${MOCK_ASSESSMENT_IDS.draft}`),
      token,
    );

    const parsed = safeParseWithSchema(playerAssessmentResponseSchema, await response.json());
    assert(parsed.success, 'detail violated PlayerAssessmentResponseDto');
    const attitude = parsed.data.values.find(
      (value) => value.metricDefinitionId === MOCK_METRIC_IDS.attitude,
    );
    expect(attitude?.numericValue).toBe(0);
    expect(
      parsed.data.values.some((value) => value.metricDefinitionId === MOCK_METRIC_IDS.stamina),
    ).toBe(false);
  });

  it('serves every catalog collection under its exact envelope', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const [templates, metrics, scales, categories, periods] = await Promise.all([
      authGet(teamPath('/assessment-catalog/templates'), token),
      authGet(teamPath('/assessment-catalog/metrics'), token),
      authGet(teamPath('/assessment-catalog/scales'), token),
      authGet(teamPath('/assessment-catalog/categories'), token),
      authGet(teamPath('/assessment-catalog/periods'), token),
    ]);

    assert(
      safeParseWithSchema(templateListResponseSchema, await templates.json()).success,
      'templates violated ListTemplatesResponseDto',
    );
    assert(
      safeParseWithSchema(metricListResponseSchema, await metrics.json()).success,
      'metrics violated ListMetricsResponseDto',
    );
    assert(
      safeParseWithSchema(scaleListResponseSchema, await scales.json()).success,
      'scales violated ListScalesResponseDto',
    );
    assert(
      safeParseWithSchema(categoryListResponseSchema, await categories.json()).success,
      'categories violated ListCategoriesResponseDto',
    );
    assert(
      safeParseWithSchema(periodListResponseSchema, await periods.json()).success,
      'periods violated ListPeriodsResponseDto',
    );
  });

  it('autosaves values under optimistic concurrency and rejects a stale version', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const path = teamPath(`/player-assessments/${MOCK_ASSESSMENT_IDS.draft}/values`);
    const saved = await authPut(path, token, {
      expectedRecordVersion: 1,
      summary: 'Autosaved.',
      values: [
        { metricDefinitionId: MOCK_METRIC_IDS.speed, numericValue: 5, textValue: null, note: null },
        {
          metricDefinitionId: MOCK_METRIC_IDS.attitude,
          numericValue: 0,
          textValue: null,
          note: null,
        },
      ],
    });
    expect(saved.status).toBe(200);
    const parsed = safeParseWithSchema(playerAssessmentResponseSchema, await saved.json());
    assert(parsed.success, 'save violated PlayerAssessmentResponseDto');
    expect(parsed.data.assessment.recordVersion).toBe(2);

    const stale = await authPut(path, token, { expectedRecordVersion: 1, values: [] });
    expect(stale.status).toBe(409);
  });

  it('walks submit, review, and publish, ending with a publication instant', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const base = teamPath(`/player-assessments/${MOCK_ASSESSMENT_IDS.draft}`);

    const submitted = await authPost(`${base}/submit`, token, { expectedRecordVersion: 1 });
    expect(submitted.status).toBe(200);
    const claimed = await authPost(`${base}/review`, token, {
      expectedRecordVersion: 2,
      decision: 'start_review',
    });
    expect(claimed.status).toBe(200);
    const approved = await authPost(`${base}/review`, token, {
      expectedRecordVersion: 3,
      decision: 'approve',
    });
    expect(approved.status).toBe(200);
    const published = await authPost(`${base}/publish`, token, { expectedRecordVersion: 4 });

    const parsed = safeParseWithSchema(playerAssessmentResponseSchema, await published.json());
    assert(parsed.success, 'publish violated PlayerAssessmentResponseDto');
    expect(parsed.data.assessment.status).toBe('published');
    expect(parsed.data.assessment.publishedAt).not.toBeNull();
  });

  it('serves the revision family of an assessment', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(
      teamPath(`/player-assessments/${MOCK_ASSESSMENT_IDS.draft}/revisions`),
      token,
    );

    const parsed = safeParseWithSchema(assessmentRevisionsResponseSchema, await response.json());
    assert(parsed.success, 'revisions violated RevisionsResponseDto');
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('serves only published assessments to their own player', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/my-assessments?limit=20&offset=0'), token);

    const parsed = safeParseWithSchema(
      publishedAssessmentListResponseSchema,
      await response.json(),
    );
    assert(parsed.success, 'own assessments violated ListPublishedAssessmentsResponseDto');
    expect(parsed.data.items.every((item) => item.status === 'published')).toBe(true);
  });

  it('serves published feedback without any private coach note', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/my-feedback?limit=20&offset=0'), token);

    const body = (await response.json()) as Record<string, unknown>;
    expect(JSON.stringify(body)).not.toContain('coachNote');
    const parsed = safeParseWithSchema(sharedFeedbackListResponseSchema, body);
    assert(parsed.success, 'own feedback violated ListSharedFeedbackResponseDto');
    expect(parsed.data.items.every((item) => item.status === 'published')).toBe(true);
  });

  it('records a feedback acknowledgement with a clarification request', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authPost(
      teamPath(`/my-feedback/${MOCK_FEEDBACK_ID}/acknowledge`),
      token,
      { clarificationRequested: true },
    );

    const parsed = safeParseWithSchema(
      feedbackAcknowledgementResponseSchema,
      await response.json(),
    );
    assert(parsed.success, 'acknowledgement violated FeedbackAcknowledgementResponseDto');
    expect(parsed.data.clarificationRequested).toBe(true);
  });

  it('serves the own development goals with their action plans', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/my-development-goals?limit=20&offset=0'), token);

    const parsed = safeParseWithSchema(developmentGoalListResponseSchema, await response.json());
    assert(parsed.success, 'own goals violated ListDevelopmentGoalsResponseDto');
    expect(parsed.data.items[0]?.actions.length).toBeGreaterThan(0);
  });

  it('transitions a goal and rejects a stale record version', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const path = teamPath(`/development-goals/${MOCK_GOAL_IDS.proposed}/transition`);

    const ok = await authPost(path, token, { transition: 'activate', expectedRecordVersion: 1 });
    expect(ok.status).toBe(200);

    const stale = await authPost(path, token, {
      transition: 'achieve',
      expectedRecordVersion: 1,
    });
    expect(stale.status).toBe(409);
  });

  it('rejects an unauthenticated read', async () => {
    const response = await fetch(apiUrl(teamPath('/player-assessments')));

    expect(response.status).toBe(401);
  });
});
