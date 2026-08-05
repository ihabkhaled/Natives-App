import { describe, expect, it } from 'vitest';

import { resolveReminderScreenState } from './reminder-screen-state.helper';

describe('resolveReminderScreenState', () => {
  /**
   * Forbidden outranks loading. Permissions and the status read resolve
   * independently, so without an order a member would briefly see a spinner
   * for a screen they are never allowed to open.
   */
  it('reports forbidden even while something is still loading', () => {
    expect(resolveReminderScreenState({ isForbidden: true, isLoading: true, hasError: true })).toBe(
      'forbidden',
    );
  });

  it('reports loading before an error it has not finished producing', () => {
    expect(
      resolveReminderScreenState({ isForbidden: false, isLoading: true, hasError: true }),
    ).toBe('loading');
  });

  it('reports an error once loading has settled', () => {
    expect(
      resolveReminderScreenState({ isForbidden: false, isLoading: false, hasError: true }),
    ).toBe('error');
  });

  it('is ready when nothing is forbidden, loading, or failed', () => {
    expect(
      resolveReminderScreenState({ isForbidden: false, isLoading: false, hasError: false }),
    ).toBe('ready');
  });
});
