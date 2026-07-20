import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestAssessment,
  requestAssessmentCategories,
  requestAssessmentMetrics,
  requestAssessmentPeriods,
  requestAssessmentRevisions,
  requestAssessmentScales,
  requestAssessmentTemplates,
  requestMyAssessments,
  requestPublishAssessment,
  requestReviewAssessment,
  requestSaveAssessmentValues,
  requestSubmitAssessment,
  requestTeamAssessments,
} from './assessments.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();

function wireHttpClient(): void {
  get.mockResolvedValue({});
  post.mockResolvedValue({});
  put.mockResolvedValue({});
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post, put } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  wireHttpClient();
});

describe('assessments.gateway', () => {
  it('lists team assessments with bounded params and an encoded team id', async () => {
    await requestTeamAssessments('team/1', 20, 0);

    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/teams/team%2F1/player-assessments');
    expect(options.params).toEqual({ limit: 20, offset: 0 });
  });

  it('reads one assessment and its revision family', async () => {
    await requestAssessment('t', 'a/7');
    await requestAssessmentRevisions('t', 'a/7');

    expect(get.mock.calls[0]?.[0]).toBe('/teams/t/player-assessments/a%2F7');
    expect(get.mock.calls[1]?.[0]).toBe('/teams/t/player-assessments/a%2F7/revisions');
  });

  it('sends only the four persisted value fields on a save', async () => {
    await requestSaveAssessmentValues('t', 'a', {
      summary: 'note',
      expectedRecordVersion: 3,
      values: [{ metricDefinitionId: 'm1', numericValue: 0, textValue: null, note: 'seen twice' }],
    });

    const [path, body] = put.mock.calls[0] as [string, Record<string, unknown>];
    expect(path).toBe('/teams/t/player-assessments/a/values');
    expect(body).toEqual({
      expectedRecordVersion: 3,
      summary: 'note',
      values: [{ metricDefinitionId: 'm1', numericValue: 0, textValue: null, note: 'seen twice' }],
    });
  });

  it('posts each workflow step to its own endpoint', async () => {
    await requestSubmitAssessment('t', 'a', 1);
    await requestReviewAssessment('t', 'a', 2, 'approve');
    await requestPublishAssessment('t', 'a', 3);

    expect(post.mock.calls[0]?.[0]).toBe('/teams/t/player-assessments/a/submit');
    expect(post.mock.calls[1]).toEqual([
      '/teams/t/player-assessments/a/review',
      { expectedRecordVersion: 2, decision: 'approve' },
      expect.anything(),
    ]);
    expect(post.mock.calls[2]?.[0]).toBe('/teams/t/player-assessments/a/publish');
  });

  it('reads the own published assessments with bounded params', async () => {
    await requestMyAssessments('t', 50, 0);

    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/teams/t/my-assessments');
    expect(options.params).toEqual({ limit: 50, offset: 0 });
  });

  it('reads every catalog collection from its own resource path', async () => {
    await requestAssessmentTemplates('t');
    await requestAssessmentMetrics('t');
    await requestAssessmentScales('t');
    await requestAssessmentCategories('t');
    await requestAssessmentPeriods('t');

    expect(get.mock.calls.map((call) => String(call[0]))).toEqual([
      '/teams/t/assessment-catalog/templates',
      '/teams/t/assessment-catalog/metrics',
      '/teams/t/assessment-catalog/scales',
      '/teams/t/assessment-catalog/categories',
      '/teams/t/assessment-catalog/periods',
    ]);
  });
});
