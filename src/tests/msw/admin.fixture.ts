import type {
  catalogEntryListResponseSchema,
  seasonListResponseSchema,
  settingsSnapshotResponseSchema,
  settingVersionListResponseSchema,
  venueListResponseSchema,
} from '@/modules/admin';
import type { SchemaOutput } from '@/packages/schema';

import { LEGACY_REPORT_BRANDING, VALID_SETTING_DOCUMENTS } from './setting-values.fixture';

type SnapshotDto = SchemaOutput<typeof settingsSnapshotResponseSchema>;
type VersionListDto = SchemaOutput<typeof settingVersionListResponseSchema>;
type VersionDto = VersionListDto['items'][number];
type SeasonListDto = SchemaOutput<typeof seasonListResponseSchema>;
type VenueListDto = SchemaOutput<typeof venueListResponseSchema>;
type CatalogListDto = SchemaOutput<typeof catalogEntryListResponseSchema>;
type CatalogKindDto = CatalogListDto['items'][number]['catalog'];
type SettingKeyDto = SnapshotDto['settings'][number]['settingKey'];

/**
 * Deterministic admin fixtures. Settings are an effective-dated, typed store
 * mirroring contract 1.3.0: canonical documents per key, `valueState` on
 * every row, a PERMANENT legacy `report_branding` row (so the legacy path
 * can never rot unnoticed), and snapshot `issues` computed from the same
 * cross-setting rule the backend applies.
 */
export const MOCK_ADMIN = {
  teamId: '00000000-0000-4000-8000-000000000001',
  draftRuleId: '30000000-0000-4000-8000-000000000001',
  approvedRuleId: '30000000-0000-4000-8000-000000000002',
  publishedRuleId: '30000000-0000-4000-8000-000000000003',
  deadLetterId: 'evt-dead-0001',
  asOf: '2026-07-20T09:00:00.000Z',
} as const;

const SETTING_KEY_VALUES: readonly SettingKeyDto[] = [
  'attendance_statuses',
  'session_types',
  'attendance_weights',
  'assessment_scale',
  'badge_tiers',
  'roster_limits',
  'notification_rules',
  'report_branding',
];

function seedVersions(): VersionDto[] {
  const seeded = SETTING_KEY_VALUES.map((settingKey, index): VersionDto => {
    const legacy = settingKey === 'report_branding';
    return {
      id: `sv-000${index + 1}`,
      teamId: MOCK_ADMIN.teamId,
      settingKey,
      effectiveFrom:
        settingKey === 'attendance_weights'
          ? '2026-02-01T00:00:00.000Z'
          : '2026-01-01T00:00:00.000Z',
      value: legacy ? LEGACY_REPORT_BRANDING : VALID_SETTING_DOCUMENTS[settingKey],
      valueState: legacy ? 'legacy' : 'valid',
      note: index === 0 ? 'Initial import' : null,
      createdBy: index === 0 ? 'user-admin-1' : null,
      createdAt: '2025-12-20T00:00:00.000Z',
    };
  });
  return seeded;
}

let versions = seedVersions();

export function resetMockAdminSettings(): void {
  versions = seedVersions();
}

function effectiveRowFor(settingKey: SettingKeyDto, asOf: string): VersionDto | undefined {
  return versions
    .filter((row) => row.settingKey === settingKey && row.effectiveFrom <= asOf)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
}

interface StatusEntryDoc {
  readonly code: string;
  readonly active: boolean;
  readonly countsTowardMetrics: boolean;
}

/** The backend's D3 surfacing: counting statuses without a weight. */
function weightIssues(asOf: string): string[] {
  const statusesRow = effectiveRowFor('attendance_statuses', asOf);
  const weightsRow = effectiveRowFor('attendance_weights', asOf);
  if (statusesRow?.valueState !== 'valid' || weightsRow?.valueState !== 'valid') {
    return [];
  }
  const statuses = (statusesRow.value as { statuses: readonly StatusEntryDoc[] }).statuses;
  const weights = (weightsRow.value as { weights: Readonly<Record<string, number>> }).weights;
  return statuses
    .filter(
      (entry) => entry.active && entry.countsTowardMetrics && weights[entry.code] === undefined,
    )
    .map((entry) => `weights_missing_status:${entry.code}`);
}

export function settingsSnapshotResponse(asOf?: string): SnapshotDto {
  const resolvedAsOf = asOf ?? new Date().toISOString();
  return {
    teamId: MOCK_ADMIN.teamId,
    asOf: resolvedAsOf,
    settings: SETTING_KEY_VALUES.map((settingKey) => {
      const row = effectiveRowFor(settingKey, resolvedAsOf);
      const legacy = row?.valueState === 'legacy';
      return {
        settingKey,
        effectiveFrom: row?.effectiveFrom ?? null,
        value: row === undefined || legacy ? null : row.value,
        valueState: row === undefined ? null : row.valueState,
        issues: settingKey === 'attendance_weights' ? weightIssues(resolvedAsOf) : [],
      };
    }),
  };
}

export function settingVersionsResponse(settingKey: string): VersionListDto {
  const items = versions
    .filter((item) => item.settingKey === settingKey)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return { items: items.map((item) => ({ ...item })), total: items.length, limit: 20, offset: 0 };
}

/** The optimistic-guard head the create handler compares against. */
export function headVersionIdFor(settingKey: string): string | null {
  return settingVersionsResponse(settingKey).items[0]?.id ?? null;
}

export function hasVersionAtInstant(settingKey: string, effectiveFrom: string): boolean {
  return versions.some(
    (row) => row.settingKey === settingKey && row.effectiveFrom === effectiveFrom,
  );
}

export function createSettingVersionRecord(
  settingKey: SettingKeyDto,
  effectiveFrom: string,
  value: unknown,
  note: string | null,
): VersionDto {
  const record: VersionDto = {
    id: `sv-${String(versions.length + 1).padStart(4, '0')}`,
    teamId: MOCK_ADMIN.teamId,
    settingKey,
    effectiveFrom,
    value,
    valueState: 'valid',
    note,
    createdBy: 'user-admin-1',
    createdAt: new Date().toISOString(),
  };
  versions = [record, ...versions];
  return { ...record };
}

export type CancelOutcome = 'cancelled' | 'not-found' | 'in-effect';

/** Future-only cancel: an in-effect row is history and stays immutable. */
export function cancelVersionRecord(versionId: string): CancelOutcome {
  const row = versions.find((candidate) => candidate.id === versionId);
  if (row === undefined) {
    return 'not-found';
  }
  if (row.effectiveFrom <= new Date().toISOString()) {
    return 'in-effect';
  }
  versions = versions.filter((candidate) => candidate.id !== versionId);
  return 'cancelled';
}

export function seasonsResponse(): SeasonListDto {
  return {
    items: [
      {
        id: 'season-2026',
        teamId: MOCK_ADMIN.teamId,
        slug: '2026',
        name: 'Season 2026',
        startsOn: '2026-01-01',
        endsOn: '2026-12-31',
        status: 'active',
        version: 1,
      },
      {
        id: 'season-2025',
        teamId: MOCK_ADMIN.teamId,
        slug: '2025',
        name: 'Season 2025',
        startsOn: '2025-01-01',
        endsOn: '2025-12-31',
        status: 'archived',
        version: 3,
      },
    ],
    total: 2,
    limit: 50,
    offset: 0,
  };
}

export function venuesResponse(): VenueListDto {
  return {
    items: [
      {
        id: 'venue-main',
        teamId: MOCK_ADMIN.teamId,
        name: 'Maadi Pitch',
        address: 'Maadi, Cairo',
        timezone: 'Africa/Cairo',
        status: 'active',
        version: 1,
      },
      {
        id: 'venue-gym',
        teamId: MOCK_ADMIN.teamId,
        name: 'Indoor Gym',
        address: null,
        timezone: 'Africa/Cairo',
        status: 'active',
        version: 1,
      },
    ],
    total: 2,
    limit: 50,
    offset: 0,
  };
}

export function catalogEntriesResponse(catalog: CatalogKindDto): CatalogListDto {
  const keys = catalog === 'position' ? ['handler', 'cutter'] : ['open', 'mixed'];
  const labels = catalog === 'position' ? ['Handler', 'Cutter'] : ['Open', 'Mixed'];
  const items: CatalogListDto['items'][number][] = keys.map((key, index) => ({
    id: `cat-${catalog}-${index + 1}`,
    teamId: MOCK_ADMIN.teamId,
    catalog,
    key,
    label: labels[index] ?? key,
    sortOrder: index + 1,
    referenceCount: index === 0 ? 4 : 0,
    status: 'active',
    version: 1,
  }));
  return { items, total: items.length, limit: 100, offset: 0 };
}
