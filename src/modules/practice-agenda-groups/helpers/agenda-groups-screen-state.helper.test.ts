import { describe, expect, it } from 'vitest';

import { resolveAgendaGroupsScreenState } from './agenda-groups-screen-state.helper';

describe('resolveAgendaGroupsScreenState', () => {
  it('reports forbidden even while something is still loading', () => {
    expect(
      resolveAgendaGroupsScreenState({ isForbidden: true, isLoading: true, hasError: true }),
    ).toBe('forbidden');
  });

  it('reports loading before an error it has not finished producing', () => {
    expect(
      resolveAgendaGroupsScreenState({ isForbidden: false, isLoading: true, hasError: true }),
    ).toBe('loading');
  });

  it('reports an error once loading has settled', () => {
    expect(
      resolveAgendaGroupsScreenState({ isForbidden: false, isLoading: false, hasError: true }),
    ).toBe('error');
  });

  it('is ready when nothing is forbidden, loading, or failed', () => {
    expect(
      resolveAgendaGroupsScreenState({ isForbidden: false, isLoading: false, hasError: false }),
    ).toBe('ready');
  });
});
