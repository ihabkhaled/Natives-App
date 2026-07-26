import { describe, expect, it } from 'vitest';

import { findCatalogEntry, resolveDefaultFormat } from './report-request-form.helper';

describe('resolveDefaultFormat', () => {
  it('preselects PDF for the document templates', () => {
    expect(resolveDefaultFormat('player_performance')).toBe('pdf');
    expect(resolveDefaultFormat('match_sheet')).toBe('pdf');
    expect(resolveDefaultFormat('analysis')).toBe('pdf');
  });

  it('preselects CSV for the rest, mirroring the generator fallback', () => {
    expect(resolveDefaultFormat('team_overview')).toBe('csv');
    expect(resolveDefaultFormat('data_quality')).toBe('csv');
  });
});

describe('findCatalogEntry', () => {
  it('finds a template and reports its privacy class', () => {
    expect(findCatalogEntry('player_performance')?.privacy).toBe('restricted');
    expect(findCatalogEntry('match_sheet')?.privacy).toBe('public');
    expect(findCatalogEntry('attendance')?.privacy).toBe('team');
  });
});
