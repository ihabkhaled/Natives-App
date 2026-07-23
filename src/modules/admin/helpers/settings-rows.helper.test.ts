import { describe, expect, it } from 'vitest';

import type { EffectiveSetting } from '../types/admin.types';
import { buildSettingsRowGroups } from './settings-rows.helper';

const t = (key: string): string => key;
const formatInstant = (iso: string): string => `formatted:${iso}`;

const ROSTER_SETTING: EffectiveSetting = {
  settingKey: 'roster_limits',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  value: { roster: { max: 27 }, matchSquad: { min: 7, max: 15 } },
  valueState: 'valid',
  issues: [],
};

const UNSET_SETTING: EffectiveSetting = {
  settingKey: 'badge_tiers',
  effectiveFrom: null,
  value: null,
  valueState: null,
  issues: [],
};

const LEGACY_SETTING: EffectiveSetting = {
  settingKey: 'report_branding',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  value: null,
  valueState: 'legacy',
  issues: [],
};

const FLAGGED_SETTING: EffectiveSetting = {
  settingKey: 'attendance_weights',
  effectiveFrom: '2026-02-01T00:00:00.000Z',
  value: { weights: { present_on_time: 1, absent: 0 } },
  valueState: 'valid',
  issues: ['weights_missing_status:injured'],
};

const SOURCES = {
  settings: [ROSTER_SETTING, UNSET_SETTING, LEGACY_SETTING, FLAGGED_SETTING],
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

  it('renders a typed value as a human summary, never serialized JSON', () => {
    expect(groups.effectiveRows[0]?.value).toBe(
      'settingSummary.rosterMax · settingSummary.rosterSquad',
    );
    expect(groups.effectiveRows.map((row) => row.value).join(' ')).not.toContain('{');
  });

  it('says "not set" for a setting with no effective value', () => {
    expect(groups.effectiveRows[1]?.value).toBe('adminSettings.notSet');
    expect(groups.effectiveRows[1]?.detail).toBe('adminSettings.notSet');
  });

  it('states when an effective value took effect', () => {
    expect(groups.effectiveRows[0]?.detail).toBe(
      'adminSettings.effectiveFromLabel: formatted:2026-01-01T00:00:00.000Z',
    );
  });

  it('flags a legacy value with warning tone and honest copy', () => {
    expect(groups.effectiveRows[2]?.value).toBe('settingSummary.legacyValue');
    expect(groups.effectiveRows[2]?.tone).toBe('warning');
  });

  it('spells out snapshot issues in the detail line with a warning tone', () => {
    expect(groups.effectiveRows[3]?.tone).toBe('warning');
    expect(groups.effectiveRows[3]?.detail).toContain('settingConstraints.weightsMissingStatus');
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

  it('produces empty groups when nothing has resolved yet', () => {
    const empty = buildSettingsRowGroups(t, formatInstant, {
      settings: undefined,
      seasons: undefined,
      venues: undefined,
      catalog: undefined,
    });

    expect(empty.effectiveRows).toEqual([]);
    expect(empty.seasonRows).toEqual([]);
    expect(empty.venueRows).toEqual([]);
    expect(empty.catalogRows).toEqual([]);
  });
});
