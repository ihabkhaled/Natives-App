import { describe, expect, it } from 'vitest';

import { buildSettingsLabels, describeAsOf } from './settings-labels.helper';

const t = (key: string): string => key;
const formatInstant = (iso: string): string => `formatted:${iso}`;

describe('buildSettingsLabels', () => {
  const labels = buildSettingsLabels(t);

  it('translates every heading through the catalog', () => {
    expect(labels.title).toBe('adminSettings.title');
    expect(labels.versionsHeading).toBe('adminSettings.versionsHeading');
    expect(labels.catalogHeading).toBe('adminSettings.catalogHeading');
  });

  it('offers one option per setting key and per catalog kind', () => {
    expect(labels.settingKeyOptions).toHaveLength(8);
    expect(labels.catalogOptions.map((option) => option.value)).toEqual([
      'division',
      'gender_format',
      'position',
    ]);
  });
});

describe('describeAsOf', () => {
  it('states the instant the snapshot was taken', () => {
    expect(describeAsOf(t, formatInstant, { asOf: '2026-07-20T09:00:00.000Z' })).toBe(
      'adminSettings.asOfLabel: formatted:2026-07-20T09:00:00.000Z',
    );
  });

  it('says "not set" before the snapshot has resolved rather than inventing a time', () => {
    expect(describeAsOf(t, formatInstant, undefined)).toBe('adminSettings.notSet');
  });
});
