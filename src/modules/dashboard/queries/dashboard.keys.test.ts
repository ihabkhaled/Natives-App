import { describe, expect, it } from 'vitest';

import { dashboardQueryKeys } from './dashboard.keys';

describe('dashboardQueryKeys', () => {
  it('roots every dashboard key under a single namespace', () => {
    expect(dashboardQueryKeys.all).toEqual(['dashboard']);
  });

  it('composes the summary key from the namespace root', () => {
    expect(dashboardQueryKeys.summary()).toEqual(['dashboard', 'summary']);
    expect(dashboardQueryKeys.summary().slice(0, 1)).toEqual([...dashboardQueryKeys.all]);
  });

  it('returns a fresh array per call so callers cannot mutate the root', () => {
    expect(dashboardQueryKeys.summary()).not.toBe(dashboardQueryKeys.summary());
    expect(dashboardQueryKeys.summary()).toEqual(dashboardQueryKeys.summary());
  });
});
