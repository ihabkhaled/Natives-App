import { assert, describe, expect, it } from 'vitest';

import { measurementHistoryResponseSchema, scoreListResponseSchema } from '@/modules/assessments';
import { buddyListResponseSchema } from '@/modules/training';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { authGet, authPost, loginAs, teamScopedPath } from '../setup/contract-api.helper';

const TEAM_ID = 'team-natives';

/**
 * Wire contract for the previously-unconsumed self-service endpoints Wave F0
 * starts reading: the own performance score, the own measurement history, and
 * buddy confirmations.
 */
describe('self-insight wire contracts (mock mode = remote contract)', () => {
  it('serves ScoreListResponseDto with an explainable, non-invented score', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamScopedPath(TEAM_ID, '/my-performance-score'), token);

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(scoreListResponseSchema, await response.json());
    assert(parsed.success, 'score list violated ScoreListResponseDto');
    expect(parsed.data.items[0]?.explanation?.components.length).toBeGreaterThan(0);
  });

  it('serves HistoryResponseDto grouped by protocol with unit metadata', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamScopedPath(TEAM_ID, '/my-measurements'), token);

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(measurementHistoryResponseSchema, await response.json());
    assert(parsed.success, 'measurements violated HistoryResponseDto');
    expect(parsed.data.entries[0]?.protocol.unit).toBe('seconds');
  });

  it('answers 403 for an analyst on both analytics self reads', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);

    expect((await authGet(teamScopedPath(TEAM_ID, '/my-performance-score'), token)).status).toBe(
      403,
    );
    expect((await authGet(teamScopedPath(TEAM_ID, '/my-measurements'), token)).status).toBe(403);
  });

  it('confirms a buddy credit through ListBuddiesResponseDto and back', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const listResponse = await authGet(teamScopedPath(TEAM_ID, '/my-activity-buddies'), token);

    expect(listResponse.status).toBe(200);
    const parsed = safeParseWithSchema(buddyListResponseSchema, await listResponse.json());
    assert(parsed.success, 'buddy list violated ListBuddiesResponseDto');
    const pending = parsed.data.items.find((buddy) => buddy.status === 'pending');
    assert(pending !== undefined, 'fixture must seed one pending credit');

    const confirmResponse = await authPost(
      teamScopedPath(TEAM_ID, `/my-activity-buddies/${pending.id}/confirm`),
      token,
      {},
    );
    expect(confirmResponse.status).toBe(200);
    const confirmed = (await confirmResponse.json()) as { status: string };
    expect(confirmed.status).toBe('confirmed');
  });

  it('answers 403 for an analyst on the buddy self routes', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);

    expect((await authGet(teamScopedPath(TEAM_ID, '/my-activity-buddies'), token)).status).toBe(
      403,
    );
    expect(
      (await authPost(teamScopedPath(TEAM_ID, '/my-activity-buddies/x/confirm'), token, {})).status,
    ).toBe(403);
  });
});
