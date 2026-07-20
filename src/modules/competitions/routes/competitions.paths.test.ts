import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  competitionDetailPath,
  competitionDetailPattern,
  competitionsPath,
  squadDetailPath,
  squadDetailPattern,
  squadsPath,
} from './competitions.paths';

describe('competition paths', () => {
  it('derives every target from the canonical route table', () => {
    expect(competitionsPath()).toBe(APP_PATHS.competitions);
    expect(competitionDetailPattern()).toBe(APP_PATHS.competitionDetail);
    expect(squadsPath()).toBe(APP_PATHS.squads);
    expect(squadDetailPattern()).toBe(APP_PATHS.squadDetail);
  });

  it('substitutes the id into the detail patterns', () => {
    expect(competitionDetailPath('comp-1')).toBe('/competitions/comp-1');
    expect(squadDetailPath('squad-1')).toBe('/squads/squad-1');
  });

  it('encodes an id that would otherwise break the path', () => {
    expect(competitionDetailPath('a/b')).toBe('/competitions/a%2Fb');
    expect(squadDetailPath('a b')).toBe('/squads/a%20b');
  });
});
