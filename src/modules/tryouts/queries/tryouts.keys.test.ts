import { describe, expect, it } from 'vitest';

import { tryoutsQueryKeys } from './tryouts.keys';

describe('tryoutsQueryKeys', () => {
  it('keeps the public event list outside any team scope', () => {
    expect(tryoutsQueryKeys.publicEvents()).toEqual(['tryouts', 'public-events']);
  });

  it('scopes every staff key to its team', () => {
    expect(tryoutsQueryKeys.list('team-a')).not.toEqual(tryoutsQueryKeys.list('team-b'));
  });

  it('nests candidates under their event and one candidate under the roll', () => {
    const candidates = tryoutsQueryKeys.candidates('t', 'e');

    expect(candidates).toEqual([...tryoutsQueryKeys.detail('t', 'e'), 'candidates']);
    expect(tryoutsQueryKeys.candidate('t', 'e', 'c')).toEqual([...candidates, 'c']);
    expect(tryoutsQueryKeys.all).toEqual(['tryouts']);
  });
});
