import * as SentryCapacitor from '@sentry/capacitor';
import * as SentryReact from '@sentry/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  initErrorReporting,
  isErrorReportingActive,
  reportError,
  resetErrorReportingForTesting,
  setReportingUser,
} from './error-reporting.facade';

vi.mock('@sentry/capacitor', () => ({ init: vi.fn(), captureException: vi.fn() }));
vi.mock('@sentry/react', () => ({ init: vi.fn(), setUser: vi.fn() }));

const DSN = 'https://public@sentry.example.com/1';

function activateReporting(): void {
  initErrorReporting({ dsn: DSN, environment: 'test' });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetErrorReportingForTesting();
});

afterEach(() => {
  resetErrorReportingForTesting();
});

describe('initErrorReporting', () => {
  it('stays disabled without a dsn', () => {
    initErrorReporting({ dsn: undefined, environment: 'test' });

    expect(isErrorReportingActive()).toBe(false);
    expect(SentryCapacitor.init).not.toHaveBeenCalled();
  });

  it('stays disabled for an empty dsn', () => {
    initErrorReporting({ dsn: '', environment: 'test' });

    expect(isErrorReportingActive()).toBe(false);
    expect(SentryCapacitor.init).not.toHaveBeenCalled();
  });

  it('initializes the capacitor sdk and forwards the react initializer', () => {
    initErrorReporting({ dsn: DSN, environment: 'production' });

    expect(isErrorReportingActive()).toBe(true);
    expect(SentryCapacitor.init).toHaveBeenCalledExactlyOnceWith(
      { dsn: DSN, environment: 'production', sendDefaultPii: false },
      SentryReact.init,
    );
  });

  it('never opts into personally identifiable data', () => {
    activateReporting();

    expect(vi.mocked(SentryCapacitor.init).mock.calls[0]?.[0]).toMatchObject({
      sendDefaultPii: false,
    });
  });

  it('deactivates reporting when re-initialized without a dsn', () => {
    activateReporting();

    initErrorReporting({ dsn: '', environment: 'test' });

    expect(isErrorReportingActive()).toBe(false);
  });
});

describe('reportError', () => {
  it('does nothing while reporting is disabled', () => {
    reportError(new Error('ignored'));

    expect(SentryCapacitor.captureException).not.toHaveBeenCalled();
  });

  it('captures the error once reporting is active', () => {
    const failure = new Error('boom');
    activateReporting();

    reportError(failure);

    expect(SentryCapacitor.captureException).toHaveBeenCalledExactlyOnceWith(failure, undefined);
  });

  it('attaches context as extra data', () => {
    const failure = new Error('boom');
    activateReporting();

    reportError(failure, { requestId: 'req-9' });

    expect(SentryCapacitor.captureException).toHaveBeenCalledExactlyOnceWith(failure, {
      extra: { requestId: 'req-9' },
    });
  });

  it('swallows a failure inside the reporting sdk', () => {
    activateReporting();
    vi.mocked(SentryCapacitor.captureException).mockImplementation(() => {
      throw new Error('sentry transport is down');
    });

    expect(() => {
      reportError(new Error('boom'), { requestId: 'req-9' });
    }).not.toThrow();
  });
});

describe('setReportingUser', () => {
  it('does nothing while reporting is disabled', () => {
    setReportingUser('u-1');

    expect(SentryReact.setUser).not.toHaveBeenCalled();
  });

  it('identifies the user by id only', () => {
    activateReporting();

    setReportingUser('u-1');

    expect(SentryReact.setUser).toHaveBeenCalledExactlyOnceWith({ id: 'u-1' });
  });

  it('clears the user on sign-out', () => {
    activateReporting();

    setReportingUser(null);

    expect(SentryReact.setUser).toHaveBeenCalledExactlyOnceWith(null);
  });
});

describe('resetErrorReportingForTesting', () => {
  it('deactivates reporting again', () => {
    activateReporting();

    resetErrorReportingForTesting();

    expect(isErrorReportingActive()).toBe(false);
    reportError(new Error('ignored'));
    expect(SentryCapacitor.captureException).not.toHaveBeenCalled();
  });
});
