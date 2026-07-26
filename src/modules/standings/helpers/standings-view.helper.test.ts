import { describe, expect, it } from 'vitest';

import type { StandingRow, StandingsRule } from '../types/standings.types';
import {
  buildQualificationChip,
  buildRuleFooter,
  buildSourceChip,
  buildStandingRowViews,
  buildStandingsColumns,
  formatDiff,
  formatSpirit,
  resolveActiveCompetitionId,
  resolveEntrantLabel,
} from './standings-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

function row(overrides: Partial<StandingRow>): StandingRow {
  return {
    standingId: 's1',
    seasonId: 'se1',
    competitionId: 'c1',
    stageId: null,
    ruleVersionId: 'rv1',
    poolLabel: null,
    entrantKind: 'opponent',
    opponentId: 'o1',
    opponentName: 'Giza',
    played: 5,
    wins: 3,
    losses: 2,
    ties: 0,
    pointsFor: 60,
    pointsAgainst: 55,
    standingPoints: 9,
    spiritScore: null,
    finalPlace: 2,
    qualification: 'undecided',
    source: 'derived',
    sourceReference: null,
    reconciliationNote: null,
    recordVersion: 1,
    recordedBy: null,
    computedAtIso: '2026-07-10T09:00:00.000Z',
    ...overrides,
  };
}

describe('formatDiff', () => {
  it('prefixes a positive difference with +', () => {
    expect(formatDiff(60, 55)).toBe('+5');
  });

  it('keeps a negative difference signed', () => {
    expect(formatDiff(40, 55)).toBe('-15');
  });

  it('renders a zero difference without a sign', () => {
    expect(formatDiff(50, 50)).toBe('0');
  });
});

describe('formatSpirit', () => {
  it('renders a null score as an em dash, never zero', () => {
    expect(formatSpirit(null)).toBe('—');
  });

  it('renders a scored value', () => {
    expect(formatSpirit(0)).toBe('0');
    expect(formatSpirit(18)).toBe('18');
  });
});

describe('resolveEntrantLabel', () => {
  it('labels our team', () => {
    expect(resolveEntrantLabel(t, row({ entrantKind: 'team', opponentName: null }))).toBe(
      'standings.ourTeamLabel',
    );
  });

  it('uses the resolved opponent name', () => {
    expect(resolveEntrantLabel(t, row({ opponentName: 'Giza' }))).toBe('Giza');
  });

  it('falls back to the unknown-opponent label when the name is absent', () => {
    expect(resolveEntrantLabel(t, row({ opponentName: null }))).toBe('standings.unknownOpponent');
  });
});

describe('buildQualificationChip', () => {
  it('returns null for undecided (muted text, not a chip)', () => {
    expect(buildQualificationChip(t, 'undecided')).toBeNull();
  });

  it('returns a chip for a decided qualification', () => {
    expect(buildQualificationChip(t, 'qualified')).toEqual({
      label: 'standings.qualificationQualified',
      tone: 'success',
    });
    expect(buildQualificationChip(t, 'relegated')?.tone).toBe('warning');
    expect(buildQualificationChip(t, 'eliminated')?.tone).toBe('medium');
    expect(buildQualificationChip(t, 'promoted')?.tone).toBe('success');
  });
});

describe('buildSourceChip', () => {
  it('returns null for the subtle derived default', () => {
    expect(buildSourceChip(t, 'derived')).toBeNull();
  });

  it('returns a visible badge for manual and import rows', () => {
    expect(buildSourceChip(t, 'manual')?.tone).toBe('warning');
    expect(buildSourceChip(t, 'import')?.tone).toBe('tertiary');
  });
});

describe('buildStandingRowViews', () => {
  it('numbers rows by their final place, falling back to index order', () => {
    const views = buildStandingRowViews(t, 'en', [
      row({ standingId: 'a', finalPlace: null }),
      row({ standingId: 'b', finalPlace: 4 }),
    ]);
    expect(views[0]?.place).toBe('1');
    expect(views[1]?.place).toBe('4');
  });

  it('highlights our team and carries provenance only for reconciled rows', () => {
    const views = buildStandingRowViews(t, 'en', [
      row({ entrantKind: 'team', opponentName: null }),
      row({ source: 'manual', reconciliationNote: 'from paper' }),
    ]);
    expect(views[0]?.isOurTeam).toBe(true);
    expect(views[0]?.provenance).toBeNull();
    expect(views[1]?.provenance).not.toBeNull();
  });
});

describe('buildStandingsColumns', () => {
  it('translates every column header', () => {
    const columns = buildStandingsColumns(t);
    expect(columns.place).toBe('standings.columnPlace');
    expect(columns.qualification).toBe('standings.columnQualification');
  });
});

describe('buildRuleFooter', () => {
  const rule: StandingsRule = {
    ruleVersionId: 'rv1',
    ruleKey: 'league',
    version: 2,
    name: 'League',
    winPoints: 3,
    lossPoints: 0,
    tiePoints: 1,
    tieBreakOrder: ['standing_points'],
    effectiveFromIso: '2026-06-01T00:00:00.000Z',
    status: 'active',
  };

  it('cites the rule version the rows were computed under', () => {
    expect(buildRuleFooter(t, [row({ ruleVersionId: 'rv1' })], [rule])).toBe(
      'standings.ruleFooter:League,2',
    );
  });

  it('reports an unknown rule when no rows are present', () => {
    expect(buildRuleFooter(t, [], [rule])).toBe('standings.ruleFooterUnknown');
  });

  it('reports an unknown rule when the cited version is missing', () => {
    expect(buildRuleFooter(t, [row({ ruleVersionId: 'gone' })], [rule])).toBe(
      'standings.ruleFooterUnknown',
    );
  });
});

describe('resolveActiveCompetitionId', () => {
  const competitions = [{ competitionId: 'first' }, { competitionId: 'second' }];

  it('prefers the explicit selection', () => {
    expect(resolveActiveCompetitionId('chosen', 'linked', competitions)).toBe('chosen');
  });

  it('falls back to the deep link', () => {
    expect(resolveActiveCompetitionId('', 'linked', competitions)).toBe('linked');
  });

  it('falls back to the first competition', () => {
    expect(resolveActiveCompetitionId('', null, competitions)).toBe('first');
    expect(resolveActiveCompetitionId('', '', competitions)).toBe('first');
  });

  it('is empty when there are no competitions', () => {
    expect(resolveActiveCompetitionId('', null, [])).toBe('');
  });
});
