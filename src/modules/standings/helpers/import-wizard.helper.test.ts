import { describe, expect, it } from 'vitest';

import { STANDINGS_LIMITS } from '../constants/standings.constants';
import type { AchievementImportReport } from '../types/achievements.types';
import { buildImportWizardView, importOutcomeTone, parseImportCsv } from './import-wizard.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

describe('parseImportCsv', () => {
  it('rejects an empty paste', () => {
    expect(parseImportCsv('   ').issue).toBe('empty');
  });

  it('rejects more rows than the import cap', () => {
    const line = 'REF,trophy,Title,2026-01-01';
    const text = Array.from({ length: STANDINGS_LIMITS.importMaxRows + 1 }, () => line).join('\n');
    expect(parseImportCsv(text).issue).toBe('tooManyRows');
  });

  it('reports the first invalid line by number', () => {
    const result = parseImportCsv('REF,trophy,Title,2026-01-01\nBAD,notacategory,X,2026-01-01');
    expect(result.issue).toBe('badRow');
    expect(result.badLine).toBe(2);
  });

  it('rejects a bad date shape', () => {
    expect(parseImportCsv('REF,trophy,Title,01-2026').issue).toBe('badRow');
  });

  it('rejects an unknown visibility', () => {
    expect(parseImportCsv('REF,trophy,Title,2026-01-01,,secret').issue).toBe('badRow');
  });

  it('parses valid rows including optional description and visibility', () => {
    const result = parseImportCsv('REF,trophy,Title,2026-01-01,Won it,public');
    expect(result.issue).toBeNull();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      reference: 'REF',
      category: 'trophy',
      description: 'Won it',
      visibility: 'public',
    });
  });

  it('treats an omitted description and visibility as null', () => {
    const result = parseImportCsv('REF,award,Title,2026-01-01');
    expect(result.rows[0]?.description).toBeNull();
    expect(result.rows[0]?.visibility).toBeNull();
  });
});

describe('importOutcomeTone', () => {
  it('tones each outcome', () => {
    expect(importOutcomeTone('imported')).toBe('success');
    expect(importOutcomeTone('skipped_duplicate')).toBe('medium');
    expect(importOutcomeTone('rejected_invalid')).toBe('danger');
  });
});

describe('buildImportWizardView', () => {
  const deps = {
    report: null as AchievementImportReport | null,
    csvText: '',
    parseError: null,
    parsedRowCount: 0,
    isOffline: false,
    isRunning: false,
    onInputChange: () => undefined,
    onParse: () => undefined,
    onCommit: () => undefined,
    onBack: () => undefined,
  };

  it('is on the input step with no preview before a run', () => {
    const view = buildImportWizardView(t, { ...deps, csvText: 'REF,trophy,T,2026-01-01' });
    expect(view.step).toBe('input');
    expect(view.previewHeading).toBeNull();
    expect(view.canParse).toBe(true);
    expect(view.canCommit).toBe(false);
  });

  it('disables parse while offline or running', () => {
    expect(buildImportWizardView(t, { ...deps, csvText: 'x', isOffline: true }).canParse).toBe(
      false,
    );
    expect(buildImportWizardView(t, { ...deps, csvText: 'x', isRunning: true }).canParse).toBe(
      false,
    );
  });

  it('shows the dry-run outcomes and allows commit at preview', () => {
    const report: AchievementImportReport = {
      dryRun: true,
      received: 3,
      imported: 1,
      skippedDuplicate: 1,
      rejectedInvalid: 1,
      rows: [
        { reference: 'A', outcome: 'imported', achievementId: null },
        { reference: 'B', outcome: 'skipped_duplicate', achievementId: null },
      ],
    };
    const view = buildImportWizardView(t, { ...deps, report, parsedRowCount: 3 });
    expect(view.step).toBe('preview');
    expect(view.outcomeRows).toHaveLength(2);
    expect(view.totals).toContain('standings.importTotals');
    expect(view.canCommit).toBe(true);
  });

  it('reaches the done step after the real commit', () => {
    const report: AchievementImportReport = {
      dryRun: false,
      received: 1,
      imported: 1,
      skippedDuplicate: 0,
      rejectedInvalid: 0,
      rows: [],
    };
    const view = buildImportWizardView(t, { ...deps, report, parsedRowCount: 1 });
    expect(view.step).toBe('done');
    expect(view.canCommit).toBe(false);
    expect(view.commitLabel).toBe('standings.importDone');
  });
});
