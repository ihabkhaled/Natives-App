import { describe, expect, it } from 'vitest';

import { buildQueuedOperation } from '@/tests/msw/matches-domain.fixture';

import { SCOREKEEPER_QUEUE_LIMIT } from '../constants/matches.constants';
import {
  selectConflictOperations,
  selectHasForeignQueue,
  selectIsQueueAtLimit,
  selectOwnedMatchQueue,
  selectReplayableOperations,
} from './scorekeeper-queue.selectors';

const MINE = buildQueuedOperation({ operationId: 'op-mine-0001', ownerUserId: 'user-1' });
const THEIRS = buildQueuedOperation({ operationId: 'op-other-001', ownerUserId: 'user-2' });
const OTHER_MATCH = buildQueuedOperation({ operationId: 'op-else-0001', matchId: 'match-9' });
const OTHER_TEAM = buildQueuedOperation({ operationId: 'op-team-0001', teamId: 'team-other' });

describe('selectOwnedMatchQueue', () => {
  it('returns only the signed-in scorekeeper own operations for this match', () => {
    const owned = selectOwnedMatchQueue(
      [MINE, THEIRS, OTHER_MATCH, OTHER_TEAM],
      'user-1',
      'team-natives',
      'match-1',
    );

    expect(owned.map((operation) => operation.operationId)).toStrictEqual(['op-mine-0001']);
  });

  it('hides every queued action while no user is resolved', () => {
    expect(selectOwnedMatchQueue([MINE, THEIRS], '', 'team-natives', 'match-1')).toStrictEqual([]);
  });

  it('hides the previous account queue after a switch', () => {
    const owned = selectOwnedMatchQueue([MINE, THEIRS], 'user-2', 'team-natives', 'match-1');

    expect(owned.map((operation) => operation.ownerUserId)).toStrictEqual(['user-2']);
  });
});

describe('selectHasForeignQueue', () => {
  it('reports work belonging to another account', () => {
    expect(selectHasForeignQueue([MINE, THEIRS], 'user-1')).toBe(true);
  });

  it('reports nothing foreign when every entry is the caller own', () => {
    expect(selectHasForeignQueue([MINE], 'user-1')).toBe(false);
  });
});

describe('selectReplayableOperations', () => {
  it('replays pending and retrying work but never a conflict or a failure', () => {
    const operations = [
      buildQueuedOperation({ operationId: 'op-a-000001', state: 'pending' }),
      buildQueuedOperation({ operationId: 'op-b-000001', state: 'retrying' }),
      buildQueuedOperation({ operationId: 'op-c-000001', state: 'conflict' }),
      buildQueuedOperation({ operationId: 'op-d-000001', state: 'failed' }),
    ];

    expect(selectReplayableOperations(operations).map((item) => item.state)).toStrictEqual([
      'pending',
      'retrying',
    ]);
  });
});

describe('selectConflictOperations', () => {
  it('collects only the operations awaiting a human decision', () => {
    const operations = [
      buildQueuedOperation({ operationId: 'op-a-000001', state: 'pending' }),
      buildQueuedOperation({ operationId: 'op-c-000001', state: 'conflict' }),
    ];

    expect(selectConflictOperations(operations).map((item) => item.operationId)).toStrictEqual([
      'op-c-000001',
    ]);
  });
});

describe('selectIsQueueAtLimit', () => {
  it('is not at the limit below the bound', () => {
    expect(selectIsQueueAtLimit([MINE])).toBe(false);
  });

  it('is at the limit once the bound is reached', () => {
    const full = Array.from({ length: SCOREKEEPER_QUEUE_LIMIT }, (_unused, index) =>
      buildQueuedOperation({ operationId: `op-${String(index).padStart(8, '0')}` }),
    );

    expect(selectIsQueueAtLimit(full)).toBe(true);
  });
});
