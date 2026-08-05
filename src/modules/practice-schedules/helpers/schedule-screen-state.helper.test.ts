import { describe, expect, it } from 'vitest';

import { resolveScheduleScreenState } from './schedule-screen-state.helper';

describe('resolveScheduleScreenState', () => {
  it('resolves forbidden ahead of every other state', () => {
    expect(
      resolveScheduleScreenState({ isForbidden: true, isLoading: true, hasError: true }),
    ).toBe('forbidden');
  });

  it('resolves loading once permissions clear forbidden', () => {
    expect(
      resolveScheduleScreenState({ isForbidden: false, isLoading: true, hasError: true }),
    ).toBe('loading');
  });

  it('resolves error once loading has settled', () => {
    expect(
      resolveScheduleScreenState({ isForbidden: false, isLoading: false, hasError: true }),
    ).toBe('error');
  });

  it('resolves ready when nothing else applies', () => {
    expect(
      resolveScheduleScreenState({ isForbidden: false, isLoading: false, hasError: false }),
    ).toBe('ready');
  });
});
