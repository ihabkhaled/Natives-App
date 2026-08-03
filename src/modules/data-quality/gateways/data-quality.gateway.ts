import { getAppHttpClient } from '@/packages/http';

import {
  dataQualityAnomaliesPath,
  dataQualityAnomalyPath,
  dataQualityRepairApplyPath,
  dataQualityRepairPreviewPath,
  dataQualityRepairRollbackPath,
  dataQualityScanPath,
  dataQualityTransitionPath,
} from '../constants/data-quality-api.constants';
import {
  anomalyResponseSchema,
  listAnomaliesResponseSchema,
  repairPreviewResponseSchema,
  repairResponseSchema,
  scanReportResponseSchema,
} from '../schemas/data-quality.schema';
import type {
  AnomaliesPage,
  AnomaliesQuery,
  Anomaly,
  Repair,
  RepairCommand,
  RepairPreview,
  ScanReport,
  TransitionAnomalyCommand,
} from '../types/data-quality.types';

export function requestAnomalies(query: AnomaliesQuery): Promise<AnomaliesPage> {
  return getAppHttpClient().get(
    dataQualityAnomaliesPath(query.teamId),
    listAnomaliesResponseSchema,
    { params: { limit: query.limit, offset: query.offset } },
  );
}

export function requestAnomaly(teamId: string, anomalyId: string): Promise<Anomaly> {
  return getAppHttpClient().get(dataQualityAnomalyPath(teamId, anomalyId), anomalyResponseSchema);
}

/** What the repair would change. A read: it never mutates anything. */
export function requestRepairPreview(command: RepairCommand): Promise<RepairPreview> {
  return getAppHttpClient().get(
    dataQualityRepairPreviewPath(command.teamId, command.anomalyId),
    repairPreviewResponseSchema,
  );
}

export function requestApplyRepair(command: RepairCommand): Promise<Repair> {
  return getAppHttpClient().post(
    dataQualityRepairApplyPath(command.teamId, command.anomalyId),
    {},
    repairResponseSchema,
  );
}

export function requestRollbackRepair(command: RepairCommand): Promise<Repair> {
  return getAppHttpClient().post(
    dataQualityRepairRollbackPath(command.teamId, command.anomalyId),
    {},
    repairResponseSchema,
  );
}

export function requestTransitionAnomaly(command: TransitionAnomalyCommand): Promise<Anomaly> {
  return getAppHttpClient().post(
    dataQualityTransitionPath(command.teamId, command.anomalyId),
    {
      transition: command.transition,
      expectedRecordVersion: command.expectedRecordVersion,
      resolution: command.resolution,
    },
    anomalyResponseSchema,
  );
}

/** Runs every rule now, rather than waiting for the scheduled sweep. */
export function requestScan(teamId: string): Promise<ScanReport> {
  return getAppHttpClient().post(
    dataQualityScanPath(teamId),
    { rules: [] },
    scanReportResponseSchema,
  );
}
