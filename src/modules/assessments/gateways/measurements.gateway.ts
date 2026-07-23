import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { myMeasurementsPath } from '../constants/assessments-api.constants';
import { measurementHistoryResponseSchema } from '../schemas/measurements.schema';

type HistoryDto = SchemaOutput<typeof measurementHistoryResponseSchema>;

/** The signed-in player's own measurement history, grouped by protocol. */
export function requestMyMeasurements(teamId: string): Promise<HistoryDto> {
  return getAppHttpClient().get(myMeasurementsPath(teamId), measurementHistoryResponseSchema);
}
