import { requestTransitionAnomaly } from '../gateways/data-quality.gateway';
import type { Anomaly, TransitionAnomalyCommand } from '../types/data-quality.types';

/** Moves one anomaly through its lifecycle; resolves the updated anomaly. */
export function transitionAnomaly(command: TransitionAnomalyCommand): Promise<Anomaly> {
  return requestTransitionAnomaly(command);
}
