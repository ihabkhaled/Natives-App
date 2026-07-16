import { beforeEach, describe, expect, it } from 'vitest';

import { useSessionStore } from '../store/session.store';
import { SESSION_STATUS } from '../types/auth.types';
import { handleAuthFailure } from './auth-failure.service';

beforeEach(() => {
  useSessionStore.setState({ status: SESSION_STATUS.Unknown });
});

describe('handleAuthFailure', () => {
  it('marks the session anonymous', () => {
    handleAuthFailure();

    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
  });

  it('drops an authenticated session when refresh is unrecoverable', () => {
    useSessionStore.getState().markAuthenticated();

    handleAuthFailure();

    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
  });

  it('is idempotent across repeated failures', () => {
    handleAuthFailure();
    handleAuthFailure();

    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
  });
});
