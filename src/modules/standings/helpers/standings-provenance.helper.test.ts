import { describe, expect, it } from 'vitest';

import type { StandingRow } from '../types/standings.types';
import { buildProvenanceView } from './standings-provenance.helper';

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
    source: 'manual',
    sourceReference: 'cup',
    reconciliationNote: 'from the paper sheet',
    recordVersion: 1,
    recordedBy: 'coach',
    computedAtIso: '2026-07-10T09:00:00.000Z',
    ...overrides,
  };
}

describe('buildProvenanceView', () => {
  it('returns null for a derived row', () => {
    expect(
      buildProvenanceView(t, 'en', row({ source: 'derived', reconciliationNote: null })),
    ).toBeNull();
  });

  it('returns null when a manual row somehow lacks a note', () => {
    expect(buildProvenanceView(t, 'en', row({ reconciliationNote: null }))).toBeNull();
  });

  it('surfaces the note, reference, recorder, and time for a reconciled row', () => {
    const view = buildProvenanceView(t, 'en', row({}));
    expect(view?.note).toBe('from the paper sheet');
    expect(view?.reference).toContain('standings.provenanceReference');
    expect(view?.recordedBy).toContain('standings.provenanceRecordedBy');
    expect(view?.computedAt).toContain('standings.provenanceComputedAt');
  });

  it('omits an absent reference and recorder', () => {
    const view = buildProvenanceView(t, 'en', row({ sourceReference: null, recordedBy: null }));
    expect(view?.reference).toBeNull();
    expect(view?.recordedBy).toBeNull();
  });
});
