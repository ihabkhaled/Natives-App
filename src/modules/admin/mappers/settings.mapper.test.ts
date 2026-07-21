import { describe, expect, it } from 'vitest';

import {
  mapCatalogEntries,
  mapSeasons,
  mapSettingsSnapshot,
  mapSettingVersionPage,
  mapVenues,
} from './settings.mapper';

describe('mapSettingsSnapshot', () => {
  it('keeps every effective value opaque and preserves a null effective instant', () => {
    const mapped = mapSettingsSnapshot({
      teamId: 'team-1',
      asOf: '2026-07-20T09:00:00.000Z',
      settings: [
        { settingKey: 'roster_limits', effectiveFrom: null, value: { max: 27 } },
        {
          settingKey: 'badge_tiers',
          effectiveFrom: '2026-01-01T00:00:00.000Z',
          value: ['bronze'],
        },
      ],
    });

    expect(mapped.asOf).toBe('2026-07-20T09:00:00.000Z');
    expect(mapped.settings[0]?.effectiveFrom).toBeNull();
    expect(mapped.settings[0]?.value).toEqual({ max: 27 });
    expect(mapped.settings[1]?.value).toEqual(['bronze']);
  });
});

describe('mapSettingVersionPage', () => {
  it('carries the total alongside the versions and preserves a null note', () => {
    const mapped = mapSettingVersionPage({
      items: [
        {
          id: 'sv-1',
          teamId: 'team-1',
          settingKey: 'roster_limits',
          effectiveFrom: '2026-02-01T00:00:00.000Z',
          value: { max: 30 },
          note: null,
          createdBy: null,
          createdAt: '2026-01-20T00:00:00.000Z',
        },
      ],
      total: 3,
      limit: 20,
      offset: 0,
    });

    expect(mapped.total).toBe(3);
    expect(mapped.items[0]?.note).toBeNull();
    expect(mapped.items[0]?.id).toBe('sv-1');
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
