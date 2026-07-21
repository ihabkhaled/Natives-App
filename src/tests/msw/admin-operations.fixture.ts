import type {
  auditListResponseSchema,
  deadLetterListResponseSchema,
  jobHealthListResponseSchema,
  outboxMetricsResponseSchema,
  replayResponseSchema,
} from '@/modules/admin';
import type { SchemaOutput } from '@/packages/schema';

import { MOCK_ADMIN } from './admin.fixture';

type MetricsDto = SchemaOutput<typeof outboxMetricsResponseSchema>;
type DeadLetterListDto = SchemaOutput<typeof deadLetterListResponseSchema>;
type JobHealthListDto = SchemaOutput<typeof jobHealthListResponseSchema>;
type AuditListDto = SchemaOutput<typeof auditListResponseSchema>;
type ReplayDto = SchemaOutput<typeof replayResponseSchema>;

/**
 * Operations fixtures. Dead letters carry an id, a type, a failure code, and
 * a count — there is deliberately no payload field, so a handler cannot leak
 * an event body even by accident.
 */
type DeadLetterRecord = DeadLetterListDto['items'][number];

function seedDeadLetters(): DeadLetterRecord[] {
  return [
    {
      eventId: MOCK_ADMIN.deadLetterId,
      eventType: 'notification.email.send',
      attempts: 5,
      failedAt: '2026-07-19T22:15:00.000Z',
      failureCode: 'SMTP_TIMEOUT',
    },
    {
      eventId: 'evt-dead-0002',
      eventType: 'report.generate',
      attempts: 3,
      failedAt: '2026-07-18T06:02:00.000Z',
      failureCode: 'RENDER_FAILED',
    },
  ];
}

let deadLetters = seedDeadLetters();
let replayed: string[] = [];

export function resetMockOperationsState(): void {
  deadLetters = seedDeadLetters();
  replayed = [];
}

export function outboxMetricsResponse(): MetricsDto {
  return {
    pending: 4,
    processing: 1,
    completed: 1842,
    deadLettered: deadLetters.length,
  };
}

export function deadLettersResponse(): DeadLetterListDto {
  return {
    items: deadLetters.map((item) => ({ ...item })),
    total: deadLetters.length,
    limit: 25,
    offset: 0,
  };
}

export function replayEventRecord(eventId: string): ReplayDto | null {
  const exists = deadLetters.some((item) => item.eventId === eventId);
  if (!exists) {
    return null;
  }
  deadLetters = deadLetters.filter((item) => item.eventId !== eventId);
  replayed = [...replayed, eventId];
  return { eventId, requeued: true };
}

export function jobHealthResponse(): JobHealthListDto {
  return {
    items: [
      {
        jobKey: 'outbox.dispatcher',
        status: 'healthy',
        lastRunAt: '2026-07-20T08:55:00.000Z',
        failureCount: 0,
      },
      {
        jobKey: 'points.recalculation',
        status: 'degraded',
        lastRunAt: '2026-07-20T04:00:00.000Z',
        failureCount: 2,
      },
      { jobKey: 'reports.expiry', status: 'failed', lastRunAt: null, failureCount: 7 },
    ],
  };
}

export function auditResponse(): AuditListDto {
  return {
    items: [
      {
        id: 'aud-0001',
        actorUserId: 'user-admin',
        action: 'settings.version.create',
        resourceType: 'team_setting',
        resourceId: 'attendance_weights',
        correlationId: 'corr-0001',
        outcome: 'success',
        diff: { value: 'redacted', effectiveFrom: 'redacted' },
        occurredAt: '2026-07-20T08:00:00.000Z',
      },
      {
        id: 'aud-0002',
        actorUserId: null,
        action: 'points.rule.publish',
        resourceType: 'points_rule',
        resourceId: MOCK_ADMIN.publishedRuleId,
        correlationId: null,
        outcome: 'denied',
        diff: {},
        occurredAt: '2026-07-19T18:30:00.000Z',
      },
    ],
    total: 2,
    limit: 25,
    offset: 0,
  };
}
