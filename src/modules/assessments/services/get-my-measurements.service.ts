import { requestMyMeasurements } from '../gateways/measurements.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapMeasurementHistory } from '../mappers/measurements.mapper';
import type { MeasurementProtocolHistory } from '../types/assessments.types';

/** Use case: load the signed-in player's own measurement history. */
export function getMyMeasurements(teamId: string): Promise<readonly MeasurementProtocolHistory[]> {
  return runAssessmentsRequest(async () =>
    mapMeasurementHistory(await requestMyMeasurements(teamId)),
  );
}
