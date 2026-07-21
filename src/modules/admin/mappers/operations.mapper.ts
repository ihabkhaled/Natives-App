import type { SchemaOutput } from '@/packages/schema';

import type {
  auditListResponseSchema,
  deadLetterListResponseSchema,
  jobHealthListResponseSchema,
  outboxMetricsResponseSchema,
} from '../schemas/operations.schema';
import type { AuditPage, DeadLetter, JobHealth, OutboxMetrics } from '../types/admin.types';

type MetricsDto = SchemaOutput<typeof outboxMetricsResponseSchema>;
type DeadLetterListDto = SchemaOutput<typeof deadLetterListResponseSchema>;
type JobHealthListDto = SchemaOutput<typeof jobHealthListResponseSchema>;
type AuditListDto = SchemaOutput<typeof auditListResponseSchema>;

export function mapOutboxMetrics(dto: MetricsDto): OutboxMetrics {
  return {
    pending: dto.pending,
    processing: dto.processing,
    completed: dto.completed,
    deadLettered: dto.deadLettered,
  };
}

export function mapDeadLetters(dto: DeadLetterListDto): readonly DeadLetter[] {
  return dto.items.map((item) => ({
    eventId: item.eventId,
    eventType: item.eventType,
    attempts: item.attempts,
    failedAt: item.failedAt,
    failureCode: item.failureCode,
  }));
}

export function mapJobHealth(dto: JobHealthListDto): readonly JobHealth[] {
  return dto.items.map((item) => ({
    jobKey: item.jobKey,
    status: item.status,
    lastRunAt: item.lastRunAt,
    failureCount: item.failureCount,
  }));
}

/**
 * The audit diff is reduced to a field count here and the values are dropped,
 * so no changed value can reach a view model — let alone a screen.
 */
export function mapAuditPage(dto: AuditListDto): AuditPage {
  return {
    total: dto.total,
    items: dto.items.map((item) => ({
      id: item.id,
      actorUserId: item.actorUserId,
      action: item.action,
      resourceType: item.resourceType,
      resourceId: item.resourceId,
      correlationId: item.correlationId,
      outcome: item.outcome,
      changedFieldCount: Object.keys(item.diff).length,
      occurredAt: item.occurredAt,
    })),
  };
}
