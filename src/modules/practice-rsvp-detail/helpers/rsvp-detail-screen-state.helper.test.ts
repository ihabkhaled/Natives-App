import { describe, expect, it } from 'vitest';

import { resolveRsvpDetailScreenState } from './rsvp-detail-screen-state.helper';

describe('resolveRsvpDetailScreenState', () => {
  it('reports forbidden even while something is still loading', () => {
    expect(
      resolveRsvpDetailScreenState({ isForbidden: true, isLoading: true, hasError: true }),
    ).toBe('forbidden');
  });

  it('reports loading before an error it has not finished producing', () => {
    expect(
      resolveRsvpDetailScreenState({ isForbidden: false, isLoading: true, hasError: true }),
    ).toBe('loading');
  });

  it('reports an error once loading has settled', () => {
    expect(
      resolveRsvpDetailScreenState({ isForbidden: false, isLoading: false, hasError: true }),
    ).toBe('error');
  });

  it('is ready when nothing is forbidden, loading, or failed', () => {
    expect(
      resolveRsvpDetailScreenState({ isForbidden: false, isLoading: false, hasError: false }),
    ).toBe('ready');
  });
});
