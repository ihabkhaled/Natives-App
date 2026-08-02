import { buildStandingRow } from '../../../../tests/factories/standings-view.factory';
import { describe, expect, it } from 'vitest';

import type { StandingRow } from '../types/standings.types';
import { buildProvenanceView } from './standings-provenance.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

/** This spec exercises the manual path, so it defaults every row to it. */
function manualRow(overrides: Partial<StandingRow> = {}): StandingRow {
  return buildStandingRow({
    source: 'manual',
    sourceReference: 'cup',
    reconciliationNote: 'from the paper sheet',
    ...overrides,
  });
}

describe('buildProvenanceView', () => {
  it('returns null for a derived row', () => {
    expect(
      buildProvenanceView(t, 'en', manualRow({ source: 'derived', reconciliationNote: null })),
    ).toBeNull();
  });

  it('returns null when a manual row somehow lacks a note', () => {
    expect(buildProvenanceView(t, 'en', manualRow({ reconciliationNote: null }))).toBeNull();
  });

  it('surfaces the note, reference, recorder, and time for a reconciled row', () => {
    const view = buildProvenanceView(t, 'en', manualRow({}));
    expect(view?.note).toBe('from the paper sheet');
    expect(view?.reference).toContain('standings.provenanceReference');
    expect(view?.recordedBy).toContain('standings.provenanceRecordedBy');
    expect(view?.computedAt).toContain('standings.provenanceComputedAt');
  });

  it('omits an absent reference and recorder', () => {
    const view = buildProvenanceView(
      t,
      'en',
      manualRow({ sourceReference: null, recordedBy: null }),
    );
    expect(view?.reference).toBeNull();
    expect(view?.recordedBy).toBeNull();
  });
});
