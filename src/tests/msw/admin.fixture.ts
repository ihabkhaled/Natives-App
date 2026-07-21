import type {
  catalogEntryListResponseSchema,
  seasonListResponseSchema,
  settingsSnapshotResponseSchema,
  settingVersionListResponseSchema,
  venueListResponseSchema,
} from '@/modules/admin';
import type { SchemaOutput } from '@/packages/schema';

type SnapshotDto = SchemaOutput<typeof settingsSnapshotResponseSchema>;
type VersionListDto = SchemaOutput<typeof settingVersionListResponseSchema>;
type VersionDto = VersionListDto['items'][number];
type SeasonListDto = SchemaOutput<typeof seasonListResponseSchema>;
type VenueListDto = SchemaOutput<typeof venueListResponseSchema>;
type CatalogListDto = SchemaOutput<typeof catalogEntryListResponseSchema>;
type CatalogKindDto = CatalogListDto['items'][number]['catalog'];
type SettingKeyDto = SnapshotDto['settings'][number]['settingKey'];

/**
 * Deterministic admin fixtures: settings, seasons, venues, catalogs, the two
 * versioned rule families, and the operations surfaces. Shapes mirror the
 * published contract; the dead-letter listing and job health are the
 * backend-pending surfaces recorded in docs/api-verification.md.
 */
export const MOCK_ADMIN = {
  teamId: '00000000-0000-4000-8000-000000000001',
  draftRuleId: '30000000-0000-4000-8000-000000000001',
  approvedRuleId: '30000000-0000-4000-8000-000000000002',
  publishedRuleId: '30000000-0000-4000-8000-000000000003',
  deadLetterId: 'evt-dead-0001',
  asOf: '2026-07-20T09:00:00.000Z',
} as const;

const SETTING_VALUES: Record<SettingKeyDto, unknown> = {
  attendance_statuses: ['present', 'late', 'excused', 'absent'],
  session_types: ['practice', 'scrimmage', 'gym'],
  attendance_weights: { present: 1, late: 0.5 },
  assessment_scale: { min: 1, max: 5 },
  badge_tiers: ['bronze', 'silver', 'gold'],
  roster_limits: { max: 27 },
  notification_rules: { practiceReminderHours: 24 },
  report_branding: { logo: 'default' },
};

export function settingsSnapshotResponse(): SnapshotDto {
  return {
    teamId: MOCK_ADMIN.teamId,
    asOf: MOCK_ADMIN.asOf,
    settings: (Object.entries(SETTING_VALUES) as [SettingKeyDto, unknown][]).map(
      ([settingKey, value], index) => ({
        settingKey,
        effectiveFrom: index === 0 ? null : '2026-01-01T00:00:00.000Z',
        value,
      }),
    ),
  };
}

type VersionRecord = VersionDto;

function seedVersions(): VersionRecord[] {
  return [
    {
      id: 'sv-0001',
      teamId: MOCK_ADMIN.teamId,
      settingKey: 'attendance_statuses',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      value: SETTING_VALUES.attendance_statuses,
      note: 'Initial import',
      createdBy: null,
      createdAt: '2025-12-20T00:00:00.000Z',
    },
    {
      id: 'sv-0002',
      teamId: MOCK_ADMIN.teamId,
      settingKey: 'attendance_weights',
      effectiveFrom: '2026-02-01T00:00:00.000Z',
      value: SETTING_VALUES.attendance_weights,
      note: null,
      createdBy: null,
      createdAt: '2026-01-20T00:00:00.000Z',
    },
  ];
}

let versions = seedVersions();

export function settingVersionsResponse(settingKey: string): VersionListDto {
  const items = versions.filter((item) => item.settingKey === settingKey);
  return { items: items.map((item) => ({ ...item })), total: items.length, limit: 20, offset: 0 };
}

export function createSettingVersionRecord(
  settingKey: SettingKeyDto,
  effectiveFrom: string,
  value: unknown,
  note: string | null,
): VersionDto {
  const record: VersionRecord = {
    id: `sv-${String(versions.length + 1).padStart(4, '0')}`,
    teamId: MOCK_ADMIN.teamId,
    settingKey,
    effectiveFrom,
    value,
    note,
    createdBy: null,
    createdAt: MOCK_ADMIN.asOf,
  };
  versions = [record, ...versions];
  return { ...record };
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
  const items: CatalogListDto['items'][number][] = [
    {
      id: `cat-${catalog}-1`,
      teamId: MOCK_ADMIN.teamId,
      catalog,
      key: 'open',
      label: 'Open',
      sortOrder: 1,
      referenceCount: 4,
      status: 'active',
      version: 1,
    },
    {
      id: `cat-${catalog}-2`,
      teamId: MOCK_ADMIN.teamId,
      catalog,
      key: 'mixed',
      label: 'Mixed',
      sortOrder: 2,
      referenceCount: 0,
      status: 'active',
      version: 1,
    },
  ];
  return { items, total: items.length, limit: 100, offset: 0 };
}
