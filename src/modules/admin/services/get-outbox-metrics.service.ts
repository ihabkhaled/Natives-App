import { runRequest } from '@/shared/errors';

import { requestOutboxMetrics } from '../gateways/operations.gateway';
import { mapOutboxMetrics } from '../mappers/operations.mapper';
import type { OutboxMetrics } from '../types/admin.types';

/** Use case: outbox queue depth and dead-letter count. */
export function getOutboxMetrics(): Promise<OutboxMetrics> {
  return runRequest(async () => mapOutboxMetrics(await requestOutboxMetrics()));
}
