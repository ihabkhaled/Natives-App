import { runRequest } from '@/shared/errors';

import { requestDeadLetters } from '../gateways/operations.gateway';
import { mapDeadLetters } from '../mappers/operations.mapper';
import type { DeadLetter } from '../types/admin.types';

/** Use case: the events that exhausted their retries. No payloads. */
export function listDeadLetters(): Promise<readonly DeadLetter[]> {
  return runRequest(async () => mapDeadLetters(await requestDeadLetters()));
}
