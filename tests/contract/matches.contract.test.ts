import { assert, describe, expect, it } from 'vitest';

import {
  matchEventListResponseSchema,
  matchListResponseSchema,
  matchOperationResponseSchema,
  matchResponseSchema,
  matchRulesetListResponseSchema,
  matchScoreboardResponseSchema,
  matchStatisticsResponseSchema,
} from '@/modules/matches';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_MATCHES } from '@/tests/msw/matches-ids.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { authGet, authPost, loginAs, teamScopedPath } from '../setup/contract-api.helper';

const TEAM = MOCK_MATCHES.teamId;
const MATCH = MOCK_MATCHES.liveMatchId;

function matchPath(suffix: string): string {
  return teamScopedPath(TEAM, `/matches/${MATCH}${suffix}`);
}

function pointBody(operationId: string, overrides: Record<string, unknown> = {}) {
  return {
    operationId,
    expectedStreamVersion: null,
    scoringSide: 'us',
    scorerMembershipId: null,
    assistMembershipId: null,
    ...overrides,
  };
}

describe('matches wire contract (mock mode = remote contract)', () => {
  it('serves the bounded match envelope', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamScopedPath(TEAM, '/matches'), token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(matchListResponseSchema, await response.json());
    assert(parsed.success, 'list violated ListMatchesResponseDto');
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('serves one match with both concurrency tokens', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const parsed = safeParseWithSchema(
      matchResponseSchema,
      await (await authGet(matchPath(''), token)).json(),
    );

    assert(parsed.success, 'match violated MatchResponseDto');
    expect(parsed.data.streamVersion).toBeGreaterThan(0);
    expect(parsed.data.recordVersion).toBeGreaterThan(0);
  });

  it('serves the scoreboard projection with the rule-set target and timeouts', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const parsed = safeParseWithSchema(
      matchScoreboardResponseSchema,
      await (await authGet(matchPath('/scoreboard'), token)).json(),
    );

    assert(parsed.success, 'scoreboard violated MatchScoreboardResponseDto');
    expect(parsed.data.target).toBe(15);
    expect(parsed.data.timeouts.allowance).toBe(2);
  });

  it('serves the append-only event stream and the published rule sets', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const events = safeParseWithSchema(
      matchEventListResponseSchema,
      await (await authGet(matchPath('/events'), token)).json(),
    );
    const rulesets = safeParseWithSchema(
      matchRulesetListResponseSchema,
      await (await authGet(teamScopedPath(TEAM, '/match-rulesets'), token)).json(),
    );

    assert(events.success, 'events violated ListMatchEventsResponseDto');
    assert(rulesets.success, 'rule sets violated ListMatchRulesetsResponseDto');
    expect(rulesets.data.items[0]?.gameTo).toBe(15);
  });

  it('applies a new operation id once and REPLAYS the same id without scoring again', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const body = pointBody('contract-operation-1');

    const first = await authPost(matchPath('/events/point'), token, body);
    const applied = safeParseWithSchema(matchOperationResponseSchema, await first.json());
    const second = await authPost(matchPath('/events/point'), token, body);
    const replayed = safeParseWithSchema(matchOperationResponseSchema, await second.json());

    assert(applied.success && replayed.success, 'operation violated MatchOperationResponseDto');
    expect(applied.data.outcome).toBe('applied');
    expect(replayed.data.outcome).toBe('replayed');
    // The authoritative score is identical: the retry did not add a point.
    expect(replayed.data.ourScore).toBe(applied.data.ourScore);
    expect(replayed.data.streamVersion).toBe(applied.data.streamVersion);
  });

  it('answers 409 for the same operation id carrying a DIFFERENT payload', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    await authPost(matchPath('/events/point'), token, pointBody('contract-operation-2'));

    const diverged = await authPost(
      matchPath('/events/point'),
      token,
      pointBody('contract-operation-2', { scorerMembershipId: 'mem-omar' }),
    );

    expect(diverged.status).toBe(409);
  });

  it('answers 409 for a stale expected stream version', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);

    const stale = await authPost(
      matchPath('/events/point'),
      token,
      pointBody('contract-operation-3', { expectedStreamVersion: 1 }),
    );

    expect(stale.status).toBe(409);
  });

  it('records a timeout and a compensating correction on the same stream', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const timeout = await authPost(matchPath('/events/timeout'), token, {
      operationId: 'contract-operation-4',
      scoringSide: 'us',
    });
    const correction = await authPost(matchPath('/events/void'), token, {
      operationId: 'contract-operation-5',
      eventId: `${MOCK_MATCHES.eventIdPrefix}014`,
      reason: 'mis-tap on the sideline',
    });

    expect(timeout.status).toBe(201);
    const parsed = safeParseWithSchema(matchOperationResponseSchema, await correction.json());
    assert(parsed.success, 'correction violated MatchOperationResponseDto');
    expect(parsed.data.event.eventType).toBe('void');
    expect(parsed.data.event.voidReason).toBe('mis-tap on the sideline');
  });

  it('rejects an operation without an id', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);

    const response = await authPost(matchPath('/events/point'), token, { scoringSide: 'us' });

    expect(response.status).toBe(400);
  });

  it('rejects a transition carrying a stale record version', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);

    const response = await authPost(matchPath('/transition'), token, {
      transition: 'pause',
      expectedRecordVersion: 1,
    });

    expect(response.status).toBe(409);
  });

  it('serves the derived statistics with nulls preserved for unmeasured values', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const parsed = safeParseWithSchema(
      matchStatisticsResponseSchema,
      await (await authGet(matchPath('/statistics'), token)).json(),
    );

    assert(parsed.success, 'statistics violated MatchStatisticsResponseDto');
    const unmeasured = parsed.data.players.find(
      (player) => player.membershipId === MOCK_MATCHES.unmeasuredMembershipId,
    );
    const zeroLine = parsed.data.players.find(
      (player) => player.membershipId === MOCK_MATCHES.zeroContributionMembershipId,
    );

    expect(unmeasured?.pointsPlayed).toBeNull();
    expect(zeroLine?.pointsPlayed).toBe(0);
    expect(zeroLine?.rostered).toBe(true);
  });

  it('rejects an unauthenticated read', async () => {
    const response = await fetch(
      `${(await import('@/packages/environment')).getEnvironment().apiBaseUrl}${matchPath('')}`,
    );

    expect(response.status).toBe(401);
  });
});
