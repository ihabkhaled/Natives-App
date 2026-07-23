import { ADMIN_BACKEND_PENDING } from '../constants/admin-api.constants';
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
import { listSuperAdmins } from '../services/list-super-admins.service';
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

/** The snapshot as of a chosen instant (drives the weights editor's rows). */
export function buildSettingsSnapshotAtQueryOptions(teamId: string, asOf: string) {
  return {
    queryKey: adminQueryKeys.settingsSnapshotAt(teamId, asOf),
    queryFn: () => getSettingsSnapshot(teamId, asOf),
    enabled: scoped(teamId) && asOf !== '',
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

/**
 * Live since contract 1.2.0. The capability-honesty marker stays in the
 * predicate so a future regression can be flipped off without dismantling
 * the designed "not available yet" machinery.
 */
export function buildDeadLettersQueryOptions(enabled: boolean) {
  return {
    queryKey: adminQueryKeys.deadLetters(),
    queryFn: () => listDeadLetters(),
    enabled: enabled && !ADMIN_BACKEND_PENDING.deadLetters,
  };
}

/** Live since contract 1.2.0; statuses derive from real recorded runs. */
export function buildJobHealthQueryOptions(enabled: boolean) {
  return {
    queryKey: adminQueryKeys.jobHealth(),
    queryFn: () => listJobHealth(),
    enabled: enabled && !ADMIN_BACKEND_PENDING.jobHealth,
  };
}

/** The super-admin roster; enabled only for a global platform administrator. */
export function buildSuperAdminsQueryOptions(enabled: boolean) {
  return {
    queryKey: adminQueryKeys.platformAdmins(),
    queryFn: () => listSuperAdmins(),
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
