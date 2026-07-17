import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppLogger } from '@/packages/logger';

import { ANALYTICS_EVENTS } from './analytics.constants';
import { setAnalyticsLoggerForTesting, trackEvent, trackScreenView } from './analytics.facade';

const debug = vi.fn<AppLogger['debug']>();

const testLogger: AppLogger = {
  debug,
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  setAnalyticsLoggerForTesting(testLogger);
});

describe('ANALYTICS_EVENTS', () => {
  it('names the built-in events owned by the package', () => {
    expect(ANALYTICS_EVENTS).toEqual({ screenView: 'screen_view' });
  });
});

describe('trackEvent', () => {
  it('records an event with its properties', () => {
    trackEvent('login_succeeded', { method: 'password', attempt: 2 });

    expect(debug).toHaveBeenCalledExactlyOnceWith('event login_succeeded', {
      method: 'password',
      attempt: 2,
    });
  });

  it('records an event without properties', () => {
    trackEvent('app_opened');

    expect(debug).toHaveBeenCalledExactlyOnceWith('event app_opened', undefined);
  });

  it('supports boolean properties', () => {
    trackEvent('offline_banner_shown', { visible: true });

    expect(debug).toHaveBeenCalledExactlyOnceWith('event offline_banner_shown', { visible: true });
  });
});

describe('trackScreenView', () => {
  it('records a screen view under the built-in event name', () => {
    trackScreenView('HomePage');

    expect(debug).toHaveBeenCalledExactlyOnceWith(`event ${ANALYTICS_EVENTS.screenView}`, {
      screen: 'HomePage',
    });
  });

  it('uses the analytics event vocabulary rather than an ad-hoc name', () => {
    trackScreenView('SettingsPage');

    expect(debug).toHaveBeenCalledExactlyOnceWith('event screen_view', { screen: 'SettingsPage' });
  });
});

describe('setAnalyticsLoggerForTesting', () => {
  it('redirects tracking to the injected logger', () => {
    const replacement = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    setAnalyticsLoggerForTesting(replacement);

    trackEvent('after_swap');

    expect(replacement.debug).toHaveBeenCalledTimes(1);
    expect(debug).not.toHaveBeenCalled();
  });
});
