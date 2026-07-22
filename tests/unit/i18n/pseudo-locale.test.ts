import { describe, expect, it } from 'vitest';

import enCatalog from '@/shared/i18n/locales/en.json';

import { buildPseudoCatalog, rankByStress, toPseudoCopy } from './pseudo-locale.fixture';

const PLACEHOLDER = /\{\{\s*\w+\s*\}\}/gu;

function placeholdersOf(value: string): readonly string[] {
  return [...value.matchAll(PLACEHOLDER)].map((match) => match[0]);
}

describe('toPseudoCopy', () => {
  it('expands a string well past its source width', () => {
    const pseudo = toPseudoCopy('Attendance');

    expect(pseudo.length).toBeGreaterThan('Attendance'.length * 1.5);
  });

  it('marks both boundaries so a clipped edge is obvious', () => {
    const pseudo = toPseudoCopy('Save');

    expect(pseudo.startsWith('⟦')).toBe(true);
    expect(pseudo.endsWith('⟧')).toBe(true);
  });

  it('accents the prose so untranslated copy stands out', () => {
    expect(toPseudoCopy('Season')).toContain('Séášöñ');
  });

  it('copies every placeholder through untouched', () => {
    const pseudo = toPseudoCopy('{{shown}} of {{total}} members');

    expect(placeholdersOf(pseudo)).toEqual(['{{shown}}', '{{total}}']);
  });

  it('still expands an empty-ish string rather than returning bare markers', () => {
    expect(toPseudoCopy('a').length).toBeGreaterThan(3);
  });
});

describe('buildPseudoCatalog', () => {
  it('keeps the real catalog tree shape', () => {
    const pseudo = buildPseudoCatalog(enCatalog);

    expect(Object.keys(pseudo)).toEqual(Object.keys(enCatalog));
  });

  it('expands every leaf of the shipped English catalog', () => {
    const pseudo = buildPseudoCatalog(enCatalog) as { settings: Record<string, string> };

    expect(pseudo.settings['title']).toMatch(/^⟦.*⟧$/u);
  });

  it('preserves the placeholders of a plural family', () => {
    const pseudo = buildPseudoCatalog(enCatalog) as { points: Record<string, string> };

    expect(placeholdersOf(pseudo.points['movementDelta_other'] ?? '')).toEqual(['{{count}}']);
  });
});

describe('rankByStress', () => {
  it('puts the widest expansion first so the worst case is reviewed first', () => {
    const ranked = rankByStress(enCatalog);
    const widths = ranked.map((entry) => entry.pseudo.length);

    expect(ranked.length).toBeGreaterThan(0);
    expect(widths).toEqual([...widths].sort((left, right) => right - left));
  });

  it('reports each entry with its dotted catalog path', () => {
    const ranked = rankByStress({ settings: { title: 'Settings' } });

    expect(ranked[0]?.path).toBe('settings.title');
    expect(ranked[0]?.source).toBe('Settings');
  });
});
