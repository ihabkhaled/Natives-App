import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { analyticsPagePath, playerAnalyticsPath, playerAnalyticsPattern } from './analytics.paths';

describe('analytics paths', () => {
  it('derives both targets from the canonical route table', () => {
    expect(analyticsPagePath()).toBe(APP_PATHS.analytics);
    expect(playerAnalyticsPattern()).toBe(APP_PATHS.playerAnalytics);
  });

  it('fills the membership segment of a concrete player target', () => {
    expect(playerAnalyticsPath('m-1')).toBe('/analytics/players/m-1');
  });

  it('escapes a membership id that carries reserved characters', () => {
    expect(playerAnalyticsPath('a/b')).toBe('/analytics/players/a%2Fb');
  });
});
