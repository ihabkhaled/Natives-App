import { beforeEach, describe, expect, it } from 'vitest';

import { SESSION_STATUS } from '../types/auth.types';
import { useSessionStore } from './session.store';

beforeEach(() => {
  useSessionStore.setState({ status: SESSION_STATUS.Unknown });
});

describe('useSessionStore', () => {
  it('starts unknown so guards wait for bootstrap instead of redirecting', () => {
    expect(useSessionStore.getInitialState().status).toBe(SESSION_STATUS.Unknown);
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Unknown);
  });

  it('flips to authenticated', () => {
    useSessionStore.getState().markAuthenticated();

    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Authenticated);
  });

  it('flips to anonymous', () => {
    useSessionStore.getState().markAnonymous();

    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
  });

  it('moves between statuses idempotently', () => {
    useSessionStore.getState().markAuthenticated();
    useSessionStore.getState().markAuthenticated();
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Authenticated);

    useSessionStore.getState().markAnonymous();
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
  });

  it('holds the status only: never tokens and never profile data', () => {
    useSessionStore.getState().markAuthenticated();

    expect(Object.keys(useSessionStore.getState()).sort()).toEqual([
      'markAnonymous',
      'markAuthenticated',
      'status',
    ]);
  });
});
