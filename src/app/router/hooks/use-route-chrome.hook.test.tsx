import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { useAppNavigation } from '@/packages/router';
import type * as PlatformModule from '@/platform';
import { applyDocumentTitle, focusElementById } from '@/platform';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useRouteChrome } from './use-route-chrome.hook';

vi.mock('@/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof PlatformModule>()),
  applyDocumentTitle: vi.fn(),
  focusElementById: vi.fn(),
}));

function Probe(): React.JSX.Element {
  useRouteChrome();
  const navigation = useAppNavigation();
  return (
    <button
      type="button"
      onClick={() => {
        navigation.push('/settings');
      }}
    >
      go
    </button>
  );
}

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
    </MemoryRouter>,
  );
}

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useRouteChrome', () => {
  it('titles the active route but does not steal focus on the first render', () => {
    renderAt('/home');

    expect(vi.mocked(applyDocumentTitle)).toHaveBeenLastCalledWith('Home');
    expect(vi.mocked(focusElementById)).not.toHaveBeenCalled();
  });

  it('falls back to the app name for a route without a title key', () => {
    renderAt('/unknown-route');

    expect(vi.mocked(applyDocumentTitle)).toHaveBeenLastCalledWith('Ultimate Natives');
  });

  it('re-titles and restores focus to main content on in-app navigation', async () => {
    renderAt('/home');

    await userEvent.click(screen.getByRole('button', { name: 'go' }));

    expect(vi.mocked(applyDocumentTitle)).toHaveBeenLastCalledWith('Settings');
    expect(vi.mocked(focusElementById)).toHaveBeenCalledWith('main-content');
  });
});
