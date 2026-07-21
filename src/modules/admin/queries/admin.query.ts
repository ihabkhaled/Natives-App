import { getOutboxMetrics } from '../services/get-outbox-metrics.service';
import { getSettingsSnapshot } from '../services/get-settings-snapshot.service';
import { listAuditEntries } from '../services/list-audit-entries.service';
import { listCalculationRules } from '../services/list-calculation-rules.service';
import { listCatalogEntries } from '../services/list-catalog-entries.service';
import { listDeadLetters } from '../services/list-dead-letters.service';
import { listJobHealth } from '../services/list-job-health.service';
import { listPointsRules } from '../services/list-points-rules.service';
import { listSeasons } from '../services/list-seasons.service';
import { listSettingVersions } from '../services/list-setting-versions.service';
import { listVenues } from '../services/list-venues.service';
import { adminQueryKeys } from './admin.keys';

function scoped(teamId: string): boolean {
  return teamId !== '';
}

export function buildSettingsSnapshotQueryOptions(teamId: string) {
  return {
    queryKey: adminQueryKeys.settingsSnapshot(teamId),
    queryFn: () => getSettingsSnapshot(teamId),
    enabled: scoped(teamId),
  };
}

export function buildSettingVersionsQueryOptions(teamId: string, settingKey: string) {
  return {
    queryKey: adminQueryKeys.settingVersions(teamId, settingKey),
    queryFn: () => listSettingVersions(teamId, settingKey),
    enabled: scoped(teamId),
  };
}

export function buildSeasonsQueryOptions(teamId: string) {
  return {
    queryKey: adminQueryKeys.seasons(teamId),
    queryFn: () => listSeasons(teamId),
    enabled: scoped(teamId),
  };
}

export function buildVenuesQueryOptions(teamId: string) {
  return {
    queryKey: adminQueryKeys.venues(teamId),
    queryFn: () => listVenues(teamId),
    enabled: scoped(teamId),
  };
}

export function buildCatalogQueryOptions(teamId: string, catalog: string) {
  return {
    queryKey: adminQueryKeys.catalog(teamId, catalog),
    queryFn: () => listCatalogEntries(teamId, catalog),
    enabled: scoped(teamId),
  };
}

/** The family selects the endpoint; both share one cache branch shape. */
export function buildRulesQueryOptions(teamId: string, family: string) {
  return {
    queryKey: adminQueryKeys.rules(teamId, family),
    queryFn: () => (family === 'points' ? listPointsRules(teamId) : listCalculationRules(teamId)),
    enabled: scoped(teamId),
  };
}

export function buildOutboxMetricsQueryOptions(enabled: boolean) {
  return {
    queryKey: adminQueryKeys.outboxMetrics(),
    queryFn: () => getOutboxMetrics(),
    enabled,
  };
}

export function buildDeadLettersQueryOptions(enabled: boolean) {
  return {
    queryKey: adminQueryKeys.deadLetters(),
    queryFn: () => listDeadLetters(),
    enabled,
  };
}

export function buildJobHealthQueryOptions(enabled: boolean) {
  return {
    queryKey: adminQueryKeys.jobHealth(),
    queryFn: () => listJobHealth(),
    enabled,
  };
}

export function buildAuditQueryOptions(teamId: string, enabled: boolean) {
  return {
    queryKey: adminQueryKeys.audit(teamId),
    queryFn: () => listAuditEntries(teamId),
    enabled: enabled && scoped(teamId),
  };
}
