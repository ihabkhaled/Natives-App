import { describe, expect, it } from 'vitest';

import {
  publicCompetitionDetailPath,
  publicCompetitionDetailPattern,
  publicCompetitionsPath,
} from './public-competitions.paths';

describe('public competitions paths', () => {
  it('anchors the showcase away from the authenticated /competitions workspace', () => {
    expect(publicCompetitionsPath()).toBe('/results');
    expect(publicCompetitionDetailPattern()).toBe('/results/:competitionSlug');
  });

  it('substitutes the slug into the detail pattern', () => {
    expect(publicCompetitionDetailPath('eunc-2026')).toBe('/results/eunc-2026');
  });

  it('encodes a slug that would otherwise break the path', () => {
    expect(publicCompetitionDetailPath('eunc 2026/x')).toBe('/results/eunc%202026%2Fx');
  });
});
