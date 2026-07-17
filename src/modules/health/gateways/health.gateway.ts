import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { HEALTH_API_PATHS } from '../constants/health-api.constants';
import { healthResponseSchema } from '../schemas/health.schema';

/** Health resource gateway: one endpoint, schema-parsed. */
export function requestHealth(): Promise<SchemaOutput<typeof healthResponseSchema>> {
  return getAppHttpClient().get(HEALTH_API_PATHS.health, healthResponseSchema, {
    skipAuth: true,
  });
}
