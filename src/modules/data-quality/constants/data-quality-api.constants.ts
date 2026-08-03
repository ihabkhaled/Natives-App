/** Data-quality paths, relative to the versioned API base URL. */
function anomaliesPath(teamId: string): string {
  return `/teams/${encodeURIComponent(teamId)}/data-quality/anomalies`;
}

export function dataQualityAnomaliesPath(teamId: string): string {
  return anomaliesPath(teamId);
}

export function dataQualityAnomalyPath(teamId: string, anomalyId: string): string {
  return `${anomaliesPath(teamId)}/${encodeURIComponent(anomalyId)}`;
}

export function dataQualityRepairPreviewPath(teamId: string, anomalyId: string): string {
  return `${dataQualityAnomalyPath(teamId, anomalyId)}/repair-preview`;
}

export function dataQualityRepairApplyPath(teamId: string, anomalyId: string): string {
  return `${dataQualityAnomalyPath(teamId, anomalyId)}/repair-apply`;
}

export function dataQualityRepairRollbackPath(teamId: string, anomalyId: string): string {
  return `${dataQualityAnomalyPath(teamId, anomalyId)}/repair-rollback`;
}

export function dataQualityTransitionPath(teamId: string, anomalyId: string): string {
  return `${dataQualityAnomalyPath(teamId, anomalyId)}/transition`;
}

export function dataQualityScanPath(teamId: string): string {
  return `/teams/${encodeURIComponent(teamId)}/data-quality/scan`;
}
