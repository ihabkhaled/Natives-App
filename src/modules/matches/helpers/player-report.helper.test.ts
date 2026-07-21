import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildPlayerStatistics } from '@/tests/msw/matches-domain.fixture';

import { buildPlayerReport } from './player-report.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

describe('buildPlayerReport', () => {
  it('gives a rostered zero-contribution player a real report that says so', () => {
    const report = buildPlayerReport(t, buildPlayerStatistics(), 'Mai Sameh');

    expect(report.heading).toBe(`${I18N_KEYS.matchStats.reportHeading}:{"player":"Mai Sameh"}`);
    expect(report.zeroNotice).toBe(I18N_KEYS.matchStats.reportZeroNotice);
    expect(report.missingNotice).toBeNull();
    expect(report.facts).toHaveLength(9);
    expect(report.facts.every((fact) => fact.value === '0')).toBe(true);
  });

  it('flags a line the stream cannot support without turning it into zeros', () => {
    const report = buildPlayerReport(
      t,
      buildPlayerStatistics({ pointsPlayed: null, goals: null }),
      'Zed',
    );

    expect(report.zeroNotice).toBeNull();
    expect(report.missingNotice).toBe(I18N_KEYS.matchStats.reportMissingNotice);
    expect(report.facts[0]?.value).toBe(I18N_KEYS.matchStats.notEnoughData);
  });

  it('reports a measured contribution plainly', () => {
    const report = buildPlayerReport(t, buildPlayerStatistics({ goals: 4 }), 'Omar');

    expect(report.zeroNotice).toBeNull();
    expect(report.facts.find((fact) => fact.key === 'goals')?.value).toBe('4');
  });
});
