import { describe, expect, it } from 'vitest';

import { buildHistoryItems } from './history-view.helper';
import type { MemberStatusEvent } from '../types/members.types';

const t = (key: string): string => key;
const ISO = '2026-07-19T10:00:00.000Z';

describe('history-view.helper', () => {
  it('builds items with reason, actor, and system fallbacks', () => {
    const events: readonly MemberStatusEvent[] = [
      {
        id: '1',
        fromStatus: 'invited',
        toStatus: 'active',
        reason: 'joined',
        actorUserId: 'user-1',
        occurredAtIso: ISO,
      },
      {
        id: '2',
        fromStatus: null,
        toStatus: 'suspended',
        reason: null,
        actorUserId: null,
        occurredAtIso: ISO,
      },
    ];
    const items = buildHistoryItems(t, 'en', events);
    expect(items[0]?.reasonLabel).toBe('members.historyReason');
    expect(items[0]?.actorLabel).toBe('user-1');
    expect(items[1]?.reasonLabel).toBeNull();
    expect(items[1]?.actorLabel).toBe('members.historySystemActor');
    expect(items[1]?.timeLabel.length).toBeGreaterThan(0);
  });
});
