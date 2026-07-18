import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestDashboardSummary } from '../gateways/dashboard.gateway';
import { mapDashboardSummary } from '../mappers/dashboard-summary.mapper';
import type { DashboardSummary } from '../types/dashboard.types';

/** Use case: load the principal's permission-shaped dashboard projection. */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const dto = await requestDashboardSummary();
    return mapDashboardSummary(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
