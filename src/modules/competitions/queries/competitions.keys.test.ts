import { describe, expect, it } from 'vitest';

import { competitionsQueryKeys } from './competitions.keys';

describe('competitionsQueryKeys', () => {
  it('scopes every key to its team so caches never cross teams', () => {
    expect(competitionsQueryKeys.list('team-a')).not.toEqual(competitionsQueryKeys.list('team-b'));
    expect(competitionsQueryKeys.team('team-a')).toEqual(['competitions', 'team', 'team-a']);
  });

  it('nests detail-scoped keys under their competition', () => {
    expect(competitionsQueryKeys.structure('t', 'c')).toEqual([
      ...competitionsQueryKeys.detail('t', 'c'),
      'structure',
    ]);
    expect(competitionsQueryKeys.fixtures('t', 'c')).toEqual([
      ...competitionsQueryKeys.detail('t', 'c'),
      'fixtures',
    ]);
  });

  it('nests every squad read under the squad it belongs to', () => {
    const squad = competitionsQueryKeys.squad('t', 's');

    expect(competitionsQueryKeys.eligibility('t', 's')).toEqual([...squad, 'eligibility']);
    expect(competitionsQueryKeys.selections('t', 's')).toEqual([...squad, 'selections']);
    expect(competitionsQueryKeys.availability('t', 's')).toEqual([...squad, 'availability']);
  });

  it('keeps the opponent directory team-scoped', () => {
    expect(competitionsQueryKeys.opponents('t')).toEqual([
      ...competitionsQueryKeys.team('t'),
      'opponents',
    ]);
    expect(competitionsQueryKeys.all).toEqual(['competitions']);
  });
});
