import { describe, expect, it } from 'vitest';

import { publicCompetitionsQueryKeys } from './public-competitions.keys';

describe('publicCompetitionsQueryKeys', () => {
  it('namespaces every key under the showcase root', () => {
    expect(publicCompetitionsQueryKeys.all).toEqual(['public-competitions']);
    expect(publicCompetitionsQueryKeys.list()).toEqual(['public-competitions', 'list']);
  });

  it('keys one competition by its slug so two pages never share a cache entry', () => {
    expect(publicCompetitionsQueryKeys.detail('eunc-2026')).toEqual([
      'public-competitions',
      'detail',
      'eunc-2026',
    ]);
    expect(publicCompetitionsQueryKeys.detail('eudl-2026')).not.toEqual(
      publicCompetitionsQueryKeys.detail('eunc-2026'),
    );
  });
});
