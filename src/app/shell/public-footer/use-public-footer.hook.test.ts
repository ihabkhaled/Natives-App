import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useSession } from '@/modules/auth';
import { APP_PATHS } from '@/shared/config';

import { buildSessionView } from '../../../../tests/factories/session-view.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { usePublicFooter } from './use-public-footer.hook';

vi.mock('@/modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  useSession: vi.fn(),
}));

const pushSpy = vi.fn();

vi.mock('@/packages/router', () => ({
  useAppNavigation: () => ({
    push: pushSpy,
    replace: vi.fn(),
    goBack: vi.fn(),
    currentPath: APP_PATHS.root,
  }),
}));

function mockSession(isResolved: boolean, isAuthenticated: boolean): void {
  vi.mocked(useSession).mockReturnValue(buildSessionView({ isResolved, isAuthenticated }));
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  mockSession(true, false);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePublicFooter', () => {
  it('stays hidden while the session is still resolving', () => {
    mockSession(false, false);

    expect(renderHook(() => usePublicFooter()).result.current.isVisible).toBe(false);
  });

  it('stays hidden once a session is authenticated', () => {
    mockSession(true, true);

    expect(renderHook(() => usePublicFooter()).result.current.isVisible).toBe(false);
  });

  it('shows for a resolved, anonymous session', () => {
    expect(renderHook(() => usePublicFooter()).result.current.isVisible).toBe(true);
  });

  it('carries the navbar spine plus the secondary marketing pages', () => {
    const { result } = renderHook(() => usePublicFooter());

    // The footer is site-wide, so it also carries the pages kept out of the
    // navbar to keep that bar legible on a phone — and it is what makes them
    // crawlable from every page.
    expect(result.current.links.map((link) => link.key)).toEqual([
      'home',
      'about',
      'team',
      'tryouts',
      'contact',
      'ultimate',
      'results',
      'news',
      'spirit',
      'gallery',
      'location',
      'achievements',
    ]);
  });

  it('routes through the shared navigation package', () => {
    const { result } = renderHook(() => usePublicFooter());

    result.current.onNavigate(APP_PATHS.about);

    expect(pushSpy).toHaveBeenCalledExactlyOnceWith(APP_PATHS.about);
  });

  it('carries the three real social profiles with translated labels', () => {
    const { result } = renderHook(() => usePublicFooter());

    expect(
      result.current.socialLinks.map((social) => ({
        key: social.key,
        href: social.href,
        label: social.label,
      })),
    ).toEqual([
      {
        key: 'facebook',
        href: 'https://www.facebook.com/ultimatenatives',
        label: 'Ultimate Natives on Facebook',
      },
      {
        key: 'instagram',
        href: 'https://www.instagram.com/ultimatenatives',
        label: 'Ultimate Natives on Instagram',
      },
      {
        key: 'tiktok',
        href: 'https://www.tiktok.com/@ultimate.natives',
        label: 'Ultimate Natives on TikTok',
      },
    ]);
    for (const social of result.current.socialLinks) {
      expect(social.icon).toBeDefined();
    }
  });

  it('stamps the copyright with the current year', () => {
    const { result } = renderHook(() => usePublicFooter());

    expect(result.current.copyright).toContain(String(new Date().getFullYear()));
  });
});
