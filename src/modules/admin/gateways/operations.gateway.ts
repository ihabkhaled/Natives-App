import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  auditPath,
  jobHealthPath,
  outboxDeadLettersPath,
  outboxMetricsPath,
  outboxReplayPath,
} from '../constants/admin-api.constants';
import { ADMIN_LIMITS } from '../constants/admin.constants';
import {
  auditListResponseSchema,
  deadLetterListResponseSchema,
  jobHealthListResponseSchema,
  outboxMetricsResponseSchema,
  replayResponseSchema,
} from '../schemas/operations.schema';

type MetricsDto = SchemaOutput<typeof outboxMetricsResponseSchema>;
type ReplayDto = SchemaOutput<typeof replayResponseSchema>;
type DeadLetterListDto = SchemaOutput<typeof deadLetterListResponseSchema>;
type JobHealthListDto = SchemaOutput<typeof jobHealthListResponseSchema>;
type AuditListDto = SchemaOutput<typeof auditListResponseSchema>;

export function requestOutboxMetrics(): Promise<MetricsDto> {
  return getAppHttpClient().get(outboxMetricsPath(), outboxMetricsResponseSchema);
}

/** Replay addresses the event by id; no payload crosses the wire either way. */
export function requestReplayEvent(eventId: string): Promise<ReplayDto> {
  return getAppHttpClient().post(outboxReplayPath(eventId), {}, replayResponseSchema);
}

export function requestDeadLetters(): Promise<DeadLetterListDto> {
  return getAppHttpClient().get(outboxDeadLettersPath(), deadLetterListResponseSchema, {
    params: { limit: ADMIN_LIMITS.deadLetters, offset: 0 },
  });
}

export function requestJobHealth(): Promise<JobHealthListDto> {
  return getAppHttpClient().get(jobHealthPath(), jobHealthListResponseSchema);
}

export function requestAuditEntries(teamId: string): Promise<AuditListDto> {
  return getAppHttpClient().get(auditPath(teamId), auditListResponseSchema, {
    params: { limit: ADMIN_LIMITS.audit, offset: 0 },
  });
}
