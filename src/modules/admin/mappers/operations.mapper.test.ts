import { describe, expect, it } from 'vitest';

import {
  mapAuditPage,
  mapDeadLetters,
  mapJobHealth,
  mapOutboxMetrics,
} from './operations.mapper';

describe('mapOutboxMetrics', () => {
  it('copies every queue depth', () => {
    expect(
      mapOutboxMetrics({ pending: 4, processing: 1, completed: 1842, deadLettered: 2 }),
    ).toEqual({ pending: 4, processing: 1, completed: 1842, deadLettered: 2 });
  });
});

describe('mapDeadLetters', () => {
  it('carries the identity and failure facts, and nothing that could be a payload', () => {
    const mapped = mapDeadLetters({
      items: [
        {
          eventId: 'evt-1',
          eventType: 'notification.email.send',
          attempts: 5,
          failedAt: '2026-07-19T22:15:00.000Z',
          failureCode: 'SMTP_TIMEOUT',
        },
      ],
      total: 1,
      limit: 25,
      offset: 0,
    });

    expect(Object.keys(mapped[0]!)).toEqual([
      'eventId',
      'eventType',
      'attempts',
      'failedAt',
      'failureCode',
    ]);
  });
});

describe('mapJobHealth', () => {
  it('preserves a job that has never run as null, not as an epoch', () => {
    const mapped = mapJobHealth({
      items: [
        { jobKey: 'reports.expiry', status: 'failed', lastRunAt: null, failureCount: 7 },
      ],
    });

    expect(mapped[0]?.lastRunAt).toBeNull();
    expect(mapped[0]?.failureCount).toBe(7);
  });
});

describe('mapAuditPage', () => {
  it('reduces a diff to a field count and drops every value', () => {
    const mapped = mapAuditPage({
      items: [
        {
          id: 'aud-1',
          actorUserId: 'user-admin',
          action: 'settings.version.create',
          resourceType: 'team_setting',
          resourceId: 'attendance_weights',
          correlationId: 'corr-1',
          outcome: 'success',
          diff: { value: 'secret', effectiveFrom: 'secret' },
          occurredAt: '2026-07-20T08:00:00.000Z',
        },
      ],
      total: 1,
      limit: 25,
      offset: 0,
    });

    expect(mapped.items[0]?.changedFieldCount).toBe(2);
    expect(JSON.stringify(mapped)).not.toContain('secret');
  });

  it('counts an empty diff as no changed fields', () => {
    const mapped = mapAuditPage({
      items: [
        {
          id: 'aud-2',
          actorUserId: null,
          action: 'points.rule.publish',
          resourceType: 'points_rule',
          resourceId: null,
          correlationId: null,
          outcome: 'denied',
          diff: {},
          occurredAt: '2026-07-19T18:30:00.000Z',
        },
      ],
      total: 1,
      limit: 25,
      offset: 0,
    });

    expect(mapped.items[0]?.changedFieldCount).toBe(0);
    expect(mapped.items[0]?.actorUserId).toBeNull();
  });
});
