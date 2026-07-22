import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildMatchStatistics, buildPlayerStatistics } from '@/tests/msw/matches-domain.fixture';

import {
  buildMatchStatisticsView,
  type MatchStatisticsViewInput,
} from './match-statistics-screen.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

const ROSTER = buildMatchStatistics({
  players: [
    buildPlayerStatistics({ membershipId: 'mem-omar', goals: 4, pointsPlayed: 12 }),
    buildPlayerStatistics({ membershipId: 'mem-mai' }),
    buildPlayerStatistics({
      membershipId: 'mem-zed',
      pointsPlayed: null,
      goals: null,
      blocks: null,
    }),
  ],
});

function input(overrides: Partial<MatchStatisticsViewInput> = {}): MatchStatisticsViewInput {
  return {
    locale: 'en',
    statistics: ROSTER,
    resolveName: (membershipId: string) => membershipId,
    status: 'ready',
    error: null,
    isOffline: false,
    openReportMembershipId: null,
    onRetry: vi.fn(),
    onBack: vi.fn(),
    onOpenReport: vi.fn(),
    onCloseReport: vi.fn(),
    ...overrides,
  };
}

describe('buildMatchStatisticsView', () => {
  it('renders EVERY rostered player, including the all-zero line', () => {
    const view = buildMatchStatisticsView(t, input());

    expect(view.playerRows).toHaveLength(3);
    expect(view.playerRows.map((row) => row.membershipId)).toContain('mem-mai');
    expect(view.playerCountLabel).toBe(`${I18N_KEYS.matchStats.playerCount}:{"count":3}`);
  });

  it('marks the zero-contribution player without hiding them', () => {
    const view = buildMatchStatisticsView(t, input());
    const zeroRow = view.playerRows.find((row) => row.membershipId === 'mem-mai');

    expect(zeroRow?.hasNoContribution).toBe(true);
    expect(zeroRow?.zeroNotice).toBe(I18N_KEYS.matchStats.zeroContribution);
    expect(zeroRow?.cells.every((cell) => cell === '0')).toBe(true);
  });

  it('prints an unmeasured line as "not enough data", never as zeros', () => {
    const view = buildMatchStatisticsView(t, input());
    const unmeasured = view.playerRows.find((row) => row.membershipId === 'mem-zed');

    expect(unmeasured?.cells[0]).toBe(I18N_KEYS.matchStats.notEnoughData);
    expect(unmeasured?.hasNoContribution).toBe(false);
  });

  it('ships an accessible table alternative alongside the chart', () => {
    const view = buildMatchStatisticsView(t, input());

    expect(view.chartRows).toHaveLength(view.chartBars.length);
    expect(view.chartColumns).toHaveLength(2);
    expect(view.chartToggle).toBe(I18N_KEYS.matchStats.chartToggle);
  });

  it('is quiet about completeness when lineups and plays were recorded', () => {
    expect(buildMatchStatisticsView(t, input()).incompleteNotice).toBeNull();
  });

  it('says why measures are missing when the stream was incomplete', () => {
    const view = buildMatchStatisticsView(
      t,
      input({ statistics: { ...ROSTER, lineupsRecorded: false } }),
    );

    expect(view.incompleteNotice).toBe(I18N_KEYS.matchStats.incompleteNotice);
  });

  it('opens the report for the selected player only', () => {
    const view = buildMatchStatisticsView(t, input({ openReportMembershipId: 'mem-mai' }));

    expect(view.report?.heading).toBe(`${I18N_KEYS.matchStats.reportHeading}:{"player":"mem-mai"}`);
    expect(view.report?.zeroNotice).toBe(I18N_KEYS.matchStats.reportZeroNotice);
  });

  it('shows no report for an unknown selection', () => {
    expect(
      buildMatchStatisticsView(t, input({ openReportMembershipId: 'nobody' })).report,
    ).toBeNull();
  });

  it('marks the video surface as an unshipped backend capability, not fake data', () => {
    const view = buildMatchStatisticsView(t, input());

    expect(view.video.title).toBe(I18N_KEYS.matchStats.videoUnavailableTitle);
    expect(view.video.deferredNote).toBe(I18N_KEYS.matchStats.videoDeferred);
  });

  it('explains the derivation and expands every term', () => {
    const view = buildMatchStatisticsView(t, input());

    expect(view.derivation).toHaveLength(5);
    expect(view.glossary).toHaveLength(6);
  });
});
