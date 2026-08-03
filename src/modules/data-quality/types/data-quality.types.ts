import type { SchemaOutput } from '@/packages/schema';

import type {
  ANOMALY_SEVERITIES,
  ANOMALY_STATUSES,
  ANOMALY_TRANSITIONS,
} from '../constants/data-quality.constants';
import type {
  anomalyResponseSchema,
  listAnomaliesResponseSchema,
  repairPreviewResponseSchema,
  repairResponseSchema,
  scanReportResponseSchema,
} from '../schemas/data-quality.schema';

export type AnomalySeverity = (typeof ANOMALY_SEVERITIES)[number];
export type AnomalyStatus = (typeof ANOMALY_STATUSES)[number];
export type AnomalyTransition = (typeof ANOMALY_TRANSITIONS)[number];

export type Anomaly = SchemaOutput<typeof anomalyResponseSchema>;
export type AnomaliesPage = SchemaOutput<typeof listAnomaliesResponseSchema>;
export type RepairPreview = SchemaOutput<typeof repairPreviewResponseSchema>;
export type Repair = SchemaOutput<typeof repairResponseSchema>;
export type ScanReport = SchemaOutput<typeof scanReportResponseSchema>;

/** One page request against the anomaly queue. */
export interface AnomaliesQuery {
  readonly teamId: string;
  readonly limit: number;
  readonly offset: number;
}

/**
 * A lifecycle move on one anomaly. `expectedRecordVersion` is the optimistic
 * guard: the server refuses the move when another operator got there first,
 * rather than silently overwriting their decision.
 */
export interface TransitionAnomalyCommand {
  readonly teamId: string;
  readonly anomalyId: string;
  readonly transition: AnomalyTransition;
  readonly expectedRecordVersion: number;
  readonly resolution: string | null;
}

export interface RepairCommand {
  readonly teamId: string;
  readonly anomalyId: string;
}
