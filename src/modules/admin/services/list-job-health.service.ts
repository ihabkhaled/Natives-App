import { runRequest } from '@/shared/errors';

import { requestJobHealth } from '../gateways/operations.gateway';
import { mapJobHealth } from '../mappers/operations.mapper';
import type { JobHealth } from '../types/admin.types';

/** Use case: scheduled-job health. */
export function listJobHealth(): Promise<readonly JobHealth[]> {
  return runRequest(async () => mapJobHealth(await requestJobHealth()));
}
