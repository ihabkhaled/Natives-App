import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestHealth } from '../gateways/health.gateway';
import { mapHealthResponseToStatus } from '../mappers/health.mapper';
import type { HealthStatus } from '../types/health.types';

/** Use case: check backend availability. */
export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    const dto = await requestHealth();
    return mapHealthResponseToStatus(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
