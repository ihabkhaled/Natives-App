import { assert, describe, expect, it } from 'vitest';

import {
  activityTypeListResponseSchema,
  evidenceListResponseSchema,
  reviewDetailResponseSchema,
  reviewQueueResponseSchema,
  submissionDetailResponseSchema,
  submissionListResponseSchema,
} from '@/modules/training';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_PERSONA_EMAILS, MOCK_PRACTICE } from '@/tests/msw/mock-data.constants';
import { MOCK_TRAINING } from '@/tests/msw/training.fixture';

import { apiUrl, authGet, authPost, loginAs, teamScopedPath } from '../setup/contract-api.helper';

function teamPath(suffix: string): string {
  return teamScopedPath(MOCK_PRACTICE.teamId, suffix);
}

describe('activities wire contract (mock mode = remote contract)', () => {
  it('serves the activity-type catalog with an honest unpriced type', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/activity-types'), token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(activityTypeListResponseSchema, await response.json());
    assert(parsed.success, 'catalog violated ListActivityTypesResponseDto');
    const pending = parsed.data.items.find((item) => item.pointsApproval === 'pending');
    expect(pending?.defaultPointValue).toBeNull();
  });

  it('serves the caller own bounded submission page', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/activity-submissions?limit=20&offset=0'), token);

    const parsed = safeParseWithSchema(submissionListResponseSchema, await response.json());
    assert(parsed.success, 'list violated ListSubmissionsResponseDto');
    expect(parsed.data.limit).toBe(20);
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('serves one submission with its buddies and evidence count', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(
      teamPath(`/activity-submissions/${MOCK_TRAINING.submittedId}`),
      token,
    );

    const parsed = safeParseWithSchema(submissionDetailResponseSchema, await response.json());
    assert(parsed.success, 'detail violated SubmissionDetailResponseDto');
    expect(parsed.data.buddies[0]?.status).toBe('pending');
  });

  it('serves evidence metadata only, never bytes', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(
      teamPath(`/activity-submissions/${MOCK_TRAINING.changesRequestedId}/evidence`),
      token,
    );

    const parsed = safeParseWithSchema(evidenceListResponseSchema, await response.json());
    assert(parsed.success, 'evidence violated ListEvidenceResponseDto');
    expect(parsed.data.items[0]?.scanStatus).toBe('clean');
  });

  it('serves the reviewer queue under its own envelope', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath('/activity-review'), token);

    const parsed = safeParseWithSchema(reviewQueueResponseSchema, await response.json());
    assert(parsed.success, 'queue violated ListReviewQueueResponseDto');
    expect(parsed.data.items.every((item) => item.status !== 'draft')).toBe(true);
  });

  it('serves one queued claim with its advisory signals', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(
      teamPath(`/activity-review/${MOCK_TRAINING.changesRequestedId}`),
      token,
    );

    const parsed = safeParseWithSchema(reviewDetailResponseSchema, await response.json());
    assert(parsed.success, 'review detail violated ReviewDetailResponseDto');
    expect(parsed.data.signals).toContain('extreme_backdating');
  });

  it('refuses a stale optimistic version with the NestJS conflict envelope', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authPost(
      teamPath(`/activity-submissions/${MOCK_TRAINING.draftId}/submit`),
      token,
      { expectedRecordVersion: 99 },
    );

    expect(response.status).toBe(409);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe('VERSION_CONFLICT');
  });

  it('rejects an anonymous read with the NestJS error envelope', async () => {
    const response = await fetch(apiUrl(teamPath('/activity-submissions')));

    expect(response.status).toBe(401);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe('UNAUTHORIZED');
  });
});
