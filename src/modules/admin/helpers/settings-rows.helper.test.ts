import { describe, expect, it } from 'vitest';

import { buildSettingsRowGroups } from './settings-rows.helper';

const t = (key: string): string => key;
const formatInstant = (iso: string): string => `formatted:${iso}`;

const SOURCES = {
  settings: [
    {
      settingKey: 'roster_limits' as const,
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      value: { max: 27 },
    },
    { settingKey: 'badge_tiers' as const, effectiveFrom: null, value: 'bronze' },
  ],
  versions: [
    {
      id: 'sv-1',
      settingKey: 'roster_limits' as const,
      effectiveFrom: '2026-02-01T00:00:00.000Z',
      value: { max: 30 },
      note: 'Squad expansion',
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 'sv-2',
      settingKey: 'roster_limits' as const,
      effectiveFrom: '2026-03-01T00:00:00.000Z',
      value: { max: 31 },
      note: null,
      createdAt: '2026-02-20T00:00:00.000Z',
    },
  ],
  seasons: [
    {
      id: 'season-1',
      name: 'Season 2026',
      slug: '2026',
      startsOn: '2026-01-01',
      endsOn: '2026-12-31',
      status: 'active' as const,
    },
  ],
  venues: [
    {
      id: 'venue-1',
      name: 'Maadi Pitch',
      address: 'Maadi, Cairo',
      timezone: 'Africa/Cairo',
      status: 'active' as const,
    },
    {
      id: 'venue-2',
      name: 'Indoor Gym',
      address: null,
      timezone: 'Africa/Cairo',
      status: 'active' as const,
    },
  ],
  catalog: [
    {
      id: 'cat-1',
      catalog: 'division' as const,
      key: 'open',
      label: 'Open',
      referenceCount: 4,
      status: 'active',
    },
  ],
};

describe('buildSettingsRowGroups', () => {
  const groups = buildSettingsRowGroups(t, formatInstant, SOURCES);

  it('renders an opaque setting value as text without interpreting it', () => {
    expect(groups.effectiveRows[0]?.value).toBe('{"max":27}');
  });

  it('renders a string setting value verbatim', () => {
    expect(groups.effectiveRows[1]?.value).toBe('bronze');
  });

  it('says "not set" for a setting with no effective instant', () => {
    expect(groups.effectiveRows[1]?.detail).toBe('adminSettings.notSet');
  });

  it('states when an effective value took effect', () => {
    expect(groups.effectiveRows[0]?.detail).toBe(
      'adminSettings.effectiveFromLabel: formatted:2026-01-01T00:00:00.000Z',
    );
  });

  it('labels a version by its effective instant and shows its note', () => {
    expect(groups.versionRows[0]?.label).toBe('formatted:2026-02-01T00:00:00.000Z');
    expect(groups.versionRows[0]?.detail).toBe('adminSettings.versionNoteLabel: Squad expansion');
  });

  it('says a version has no note rather than rendering an empty line', () => {
    expect(groups.versionRows[1]?.detail).toBe('adminSettings.versionNoNote');
  });

  it('shows a season window and its status tone', () => {
    expect(groups.seasonRows[0]?.detail).toBe('adminSettings.seasonWindow');
    expect(groups.seasonRows[0]?.tone).toBe('success');
  });

  it('states when a venue has no address', () => {
    expect(groups.venueRows[0]?.detail).toBe('Maadi, Cairo');
    expect(groups.venueRows[1]?.detail).toBe('adminSettings.venueNoAddress');
  });

  it('shows how often a catalog entry is referenced', () => {
    expect(groups.catalogRows[0]?.detail).toBe('adminSettings.referenceCountLabel');
  });

  it('renders a value the server omitted as null rather than as "undefined"', () => {
    const rows = buildSettingsRowGroups(t, formatInstant, {
      ...SOURCES,
      settings: [{ settingKey: 'badge_tiers' as const, effectiveFrom: null, value: undefined }],
    }).effectiveRows;

    expect(rows[0]?.value).toBe('null');
  });

  it('produces empty groups when nothing has resolved yet', () => {
    const empty = buildSettingsRowGroups(t, formatInstant, {
      settings: undefined,
      versions: undefined,
      seasons: undefined,
      venues: undefined,
      catalog: undefined,
    });

    expect(empty.effectiveRows).toEqual([]);
    expect(empty.versionRows).toEqual([]);
    expect(empty.seasonRows).toEqual([]);
    expect(empty.venueRows).toEqual([]);
    expect(empty.catalogRows).toEqual([]);
  });
});
