import { describe, expect, it } from 'vitest';

import { buildQueuedOperation } from '@/tests/msw/matches-domain.fixture';

import {
  buildScorekeeperRequestBody,
  describeScorekeeperPayload,
  fingerprintScorekeeperPayload,
} from './scorekeeper-payload.helper';

describe('fingerprintScorekeeperPayload', () => {
  it('fingerprints a point by side, scorer, and assist', () => {
    expect(
      fingerprintScorekeeperPayload({
        kind: 'point',
        scoringSide: 'us',
        scorerMembershipId: 'mem-omar',
        assistMembershipId: null,
      }),
    ).toBe('point|us|mem-omar|-');
  });

  it('gives two points with different scorers different fingerprints', () => {
    const first = fingerprintScorekeeperPayload({
      kind: 'point',
      scoringSide: 'us',
      scorerMembershipId: 'mem-omar',
      assistMembershipId: null,
    });
    const second = fingerprintScorekeeperPayload({
      kind: 'point',
      scoringSide: 'us',
      scorerMembershipId: 'mem-nadia',
      assistMembershipId: null,
    });

    expect(first).not.toBe(second);
  });

  it('fingerprints a timeout by side', () => {
    expect(fingerprintScorekeeperPayload({ kind: 'timeout', scoringSide: 'them' })).toBe(
      'timeout|them',
    );
  });

  it('fingerprints a correction by the event it compensates and the reason', () => {
    expect(
      fingerprintScorekeeperPayload({ kind: 'void', eventId: 'event-9', reason: 'wrong side' }),
    ).toBe('void|event-9|wrong side');
  });
});

describe('describeScorekeeperPayload', () => {
  it('describes a point by the scoring side', () => {
    expect(
      describeScorekeeperPayload({
        kind: 'point',
        scoringSide: 'them',
        scorerMembershipId: null,
        assistMembershipId: null,
      }),
    ).toBe('them');
  });

  it('describes a correction by the event it compensates', () => {
    expect(
      describeScorekeeperPayload({ kind: 'void', eventId: 'event-3', reason: 'mis-tap' }),
    ).toBe('event-3');
  });
});

describe('buildScorekeeperRequestBody', () => {
  it('sends the operation id and the base stream version with a point', () => {
    const body = buildScorekeeperRequestBody(
      buildQueuedOperation({ operationId: 'op-1234abcd', baseStreamVersion: 14 }),
    );

    expect(body).toStrictEqual({
      operationId: 'op-1234abcd',
      expectedStreamVersion: 14,
      scoringSide: 'us',
      scorerMembershipId: null,
      assistMembershipId: null,
    });
  });

  it('omits the stream version on a timeout, which the contract does not gate', () => {
    const body = buildScorekeeperRequestBody(
      buildQueuedOperation({
        kind: 'timeout',
        payload: { kind: 'timeout', scoringSide: 'them' },
      }),
    );

    expect(body).toStrictEqual({ operationId: 'operation-abcdefgh', scoringSide: 'them' });
  });

  it('sends the event and the written reason with a correction', () => {
    const body = buildScorekeeperRequestBody(
      buildQueuedOperation({
        kind: 'void',
        payload: { kind: 'void', eventId: 'event-7', reason: 'double tap' },
      }),
    );

    expect(body).toStrictEqual({
      operationId: 'operation-abcdefgh',
      eventId: 'event-7',
      reason: 'double tap',
    });
  });
});
