import { describe, expect, it } from 'vitest';

import { matchesQueryKeys } from './matches.keys';

describe('matchesQueryKeys', () => {
  it('scopes every key under the team', () => {
    expect(matchesQueryKeys.all).toStrictEqual(['matches']);
    expect(matchesQueryKeys.team('t1')).toStrictEqual(['matches', 'team', 't1']);
    expect(matchesQueryKeys.list('t1')).toStrictEqual(['matches', 'team', 't1', 'list']);
    expect(matchesQueryKeys.rulesets('t1')).toStrictEqual(['matches', 'team', 't1', 'rulesets']);
  });

  it('nests every match branch under one detail key so one invalidation refreshes all', () => {
    const detail = matchesQueryKeys.detail('t1', 'm1');

    expect(matchesQueryKeys.scoreboard('t1', 'm1')).toStrictEqual([...detail, 'scoreboard']);
    expect(matchesQueryKeys.events('t1', 'm1')).toStrictEqual([...detail, 'events']);
    expect(matchesQueryKeys.statistics('t1', 'm1')).toStrictEqual([...detail, 'statistics']);
  });
});
