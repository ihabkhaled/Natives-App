import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildPlayerStatistics } from '@/tests/msw/matches-domain.fixture';

import {
  buildPlayerStatCells,
  buildPlayerStatRow,
  formatStatValue,
  hasMissingMeasures,
  hasNoRecordedContribution,
  sortPlayerRows,
} from './player-stat-row.helper';

const t = (key: string): string => key;
const resolveName = (membershipId: string): string =>
  membershipId === 'mem-omar' ? 'Omar Hassan' : membershipId;

describe('formatStatValue', () => {
  it('prints a measured zero as 0', () => {
    expect(formatStatValue(t, 0)).toBe('0');
  });

  it('prints an unmeasured value as "not enough data", never 0', () => {
    expect(formatStatValue(t, null)).toBe(I18N_KEYS.matchStats.notEnoughData);
  });

  it('prints a measured number', () => {
    expect(formatStatValue(t, 7)).toBe('7');
  });
});

describe('hasNoRecordedContribution', () => {
  it('is true only when every measure is a measured zero', () => {
    expect(hasNoRecordedContribution(buildPlayerStatistics())).toBe(true);
  });

  it('is false when any measure is non-zero', () => {
    expect(hasNoRecordedContribution(buildPlayerStatistics({ goals: 1 }))).toBe(false);
  });

  it('is false when a measure is missing rather than zero', () => {
    expect(hasNoRecordedContribution(buildPlayerStatistics({ goals: null }))).toBe(false);
  });
});

describe('hasMissingMeasures', () => {
  it('detects a null measure', () => {
    expect(hasMissingMeasures(buildPlayerStatistics({ blocks: null }))).toBe(true);
  });

  it('reports nothing missing on a fully measured line', () => {
    expect(hasMissingMeasures(buildPlayerStatistics())).toBe(false);
  });
});

describe('buildPlayerStatCells', () => {
  it('renders eight measures in column order', () => {
    const cells = buildPlayerStatCells(
      t,
      buildPlayerStatistics({ pointsPlayed: 12, goals: 4, blocks: null }),
    );

    expect(cells).toStrictEqual([
      '12',
      '0',
      '0',
      '4',
      '0',
      '0',
      '0',
      I18N_KEYS.matchStats.notEnoughData,
    ]);
  });
});

describe('buildPlayerStatRow', () => {
  it('keeps a rostered zero-contribution player with an explicit notice', () => {
    const row = buildPlayerStatRow(t, buildPlayerStatistics(), resolveName);

    expect(row.hasNoContribution).toBe(true);
    expect(row.zeroNotice).toBe(I18N_KEYS.matchStats.zeroContribution);
    expect(row.rosteredLabel).toBe(I18N_KEYS.matchStats.rosteredBadge);
    expect(row.name).toBe('Omar Hassan');
  });

  it('labels a non-rostered contributor and leaves the zero notice off', () => {
    const row = buildPlayerStatRow(
      t,
      buildPlayerStatistics({ membershipId: 'mem-guest', rostered: false, goals: 1 }),
      resolveName,
    );

    expect(row.rosteredLabel).toBe(I18N_KEYS.matchStats.unrosteredBadge);
    expect(row.zeroNotice).toBeNull();
  });

  it('keeps an unresolved membership in the table under its id', () => {
    const row = buildPlayerStatRow(
      t,
      buildPlayerStatistics({ membershipId: 'mem-unknown' }),
      resolveName,
    );

    expect(row.name).toBe('mem-unknown');
  });
});

describe('sortPlayerRows', () => {
  it('puts rostered players first, then sorts alphabetically inside each group', () => {
    const rows = [
      buildPlayerStatRow(t, buildPlayerStatistics({ membershipId: 'zoe' }), (id) => id),
      buildPlayerStatRow(
        t,
        buildPlayerStatistics({ membershipId: 'guest', rostered: false }),
        (id) => id,
      ),
      buildPlayerStatRow(t, buildPlayerStatistics({ membershipId: 'ali' }), (id) => id),
      buildPlayerStatRow(
        t,
        buildPlayerStatistics({ membershipId: 'anon', rostered: false }),
        (id) => id,
      ),
    ];

    expect(sortPlayerRows(rows).map((row) => row.name)).toStrictEqual([
      'ali',
      'zoe',
      'anon',
      'guest',
    ]);
  });
});
