import { requestScan } from '../gateways/data-quality.gateway';
import type { ScanReport } from '../types/data-quality.types';

/** Runs every rule now, rather than waiting for the scheduled sweep. */
export function runScan(teamId: string): Promise<ScanReport> {
  return requestScan(teamId);
}
