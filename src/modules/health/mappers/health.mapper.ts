import type { SchemaOutput } from '@/packages/schema';

import type { healthResponseSchema } from '../schemas/health.schema';
import type { HealthStatus } from '../types/health.types';

export function mapHealthResponseToStatus(
  dto: SchemaOutput<typeof healthResponseSchema>,
): HealthStatus {
  return {
    isHealthy: dto.status === 'ok',
    version: dto.version,
    checkedAtIso: dto.timestamp,
  };
}
