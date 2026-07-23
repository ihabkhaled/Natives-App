import { describe, expect, it } from 'vitest';

import {
  AUDIT_NONSENSE_PAYLOAD,
  VALID_BADGE_TIERS,
  VALID_ROSTER_LIMITS,
} from '@/tests/msw/setting-values.fixture';
import {
  mapCatalogEntries,
  mapSeasons,
  mapSettingsSnapshot,
  mapSettingVersionPage,
  mapVenues,
} from './settings.mapper';

function versionRow(overrides: Record<string, unknown>) {
  return {
    id: 'sv-1',
    teamId: 'team-1',
    settingKey: 'roster_limits' as const,
    effectiveFrom: '2026-02-01T00:00:00.000Z',
    value: VALID_ROSTER_LIMITS,
    valueState: 'valid' as const,
    note: null,
    createdBy: null,
    createdAt: '2026-01-20T00:00:00.000Z',
    ...overrides,
  };
}

describe('mapSettingsSnapshot', () => {
  it('parses a valid row through the per-key union and keeps its issues', () => {
    const mapped = mapSettingsSnapshot({
      teamId: 'team-1',
      asOf: '2026-07-20T09:00:00.000Z',
      settings: [
        {
          settingKey: 'roster_limits',
          effectiveFrom: '2026-01-01T00:00:00.000Z',
          value: VALID_ROSTER_LIMITS,
          valueState: 'valid',
          issues: ['weights_missing_status:injured'],
        },
      ],
    });

    expect(mapped.asOf).toBe('2026-07-20T09:00:00.000Z');
    expect(mapped.settings[0]?.value).toEqual(VALID_ROSTER_LIMITS);
    expect(mapped.settings[0]?.issues).toEqual(['weights_missing_status:injured']);
  });

  it('resolves a legacy or unset row to null, never a raw document', () => {
    const mapped = mapSettingsSnapshot({
      teamId: 'team-1',
      asOf: '2026-07-20T09:00:00.000Z',
      settings: [
        {
          settingKey: 'report_branding',
          effectiveFrom: '2026-01-01T00:00:00.000Z',
          value: null,
          valueState: 'legacy',
          issues: [],
        },
        {
          settingKey: 'badge_tiers',
          effectiveFrom: null,
          value: null,
          valueState: null,
          issues: [],
        },
      ],
    });

    expect(mapped.settings[0]?.value).toBeNull();
    expect(mapped.settings[0]?.valueState).toBe('legacy');
    expect(mapped.settings[1]?.value).toBeNull();
    expect(mapped.settings[1]?.valueState).toBeNull();
  });

  it('fails loudly when a valid-marked document does not parse', () => {
    expect(() =>
      mapSettingsSnapshot({
        teamId: 'team-1',
        asOf: '2026-07-20T09:00:00.000Z',
        settings: [
          {
            settingKey: 'attendance_statuses',
            effectiveFrom: '2026-01-01T00:00:00.000Z',
            value: AUDIT_NONSENSE_PAYLOAD,
            valueState: 'valid',
            issues: [],
          },
        ],
      }),
    ).toThrow('contract violation');
  });
});

describe('mapSettingVersionPage', () => {
  it('wraps a valid version as a typed value and preserves the actor', () => {
    const mapped = mapSettingVersionPage({
      items: [versionRow({ createdBy: 'user-admin-1' })],
      total: 3,
      limit: 20,
      offset: 0,
    });

    expect(mapped.total).toBe(3);
    expect(mapped.items[0]?.createdBy).toBe('user-admin-1');
    expect(mapped.items[0]?.value).toEqual({ state: 'valid', value: VALID_ROSTER_LIMITS });
  });

  it('wraps a legacy version with its raw document intact', () => {
    const mapped = mapSettingVersionPage({
      items: [versionRow({ valueState: 'legacy', value: { logo: 'default' } })],
      total: 1,
      limit: 20,
      offset: 0,
    });

    expect(mapped.items[0]?.value).toEqual({ state: 'legacy', raw: { logo: 'default' } });
  });

  it('fails loudly when a valid-marked version does not parse', () => {
    expect(() =>
      mapSettingVersionPage({
        items: [versionRow({ settingKey: 'badge_tiers', value: { tiers: [] } })],
        total: 1,
        limit: 20,
        offset: 0,
      }),
    ).toThrow('contract violation');
  });

  it('keeps VALID_BADGE_TIERS parseable end to end', () => {
    const mapped = mapSettingVersionPage({
      items: [versionRow({ settingKey: 'badge_tiers', value: VALID_BADGE_TIERS })],
      total: 1,
      limit: 20,
      offset: 0,
    });

    expect(mapped.items[0]?.value.state).toBe('valid');
  });
});

describe('mapSeasons', () => {
  it('keeps the season window and status', () => {
    expect(
      mapSeasons({
        items: [
          {
            id: 'season-1',
            teamId: 'team-1',
            slug: '2026',
            name: 'Season 2026',
            startsOn: '2026-01-01',
            endsOn: '2026-12-31',
            status: 'active',
            version: 1,
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      }),
    ).toEqual([
      {
        id: 'season-1',
        name: 'Season 2026',
        slug: '2026',
        startsOn: '2026-01-01',
        endsOn: '2026-12-31',
        status: 'active',
      },
    ]);
  });
});

describe('mapVenues', () => {
  it('preserves a null address rather than inventing an empty string', () => {
    const mapped = mapVenues({
      items: [
        {
          id: 'venue-1',
          teamId: 'team-1',
          name: 'Indoor Gym',
          address: null,
          timezone: 'Africa/Cairo',
          status: 'active',
          version: 1,
        },
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });

    expect(mapped[0]?.address).toBeNull();
    expect(mapped[0]?.timezone).toBe('Africa/Cairo');
  });
});

describe('mapCatalogEntries', () => {
  it('keeps the reference count so a screen can warn before an archive', () => {
    const mapped = mapCatalogEntries({
      items: [
        {
          id: 'cat-1',
          teamId: 'team-1',
          catalog: 'division',
          key: 'open',
          label: 'Open',
          sortOrder: 1,
          referenceCount: 4,
          status: 'active',
          version: 1,
        },
      ],
      total: 1,
      limit: 100,
      offset: 0,
    });

    expect(mapped[0]?.referenceCount).toBe(4);
    expect(mapped[0]?.catalog).toBe('division');
  });
});
