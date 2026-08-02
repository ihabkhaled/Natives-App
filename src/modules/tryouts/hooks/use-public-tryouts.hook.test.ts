import { act, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNetworkStatus } from '@/platform';
import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { buildTryoutEvent } from '../../../../tests/factories/tryouts.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { listPublicTryoutEvents } from '../services/list-public-tryout-events.service';
import { registerCandidate } from '../services/register-candidate.service';
import type { PublicTryoutsView } from '../types/public-tryouts-view.types';
import { usePublicTryouts } from './use-public-tryouts.hook';

vi.mock('@/platform', async () => {
  const { createPlatformMock } = await import('../../../../tests/setup/platform-mock.helper');
  return createPlatformMock();
});
vi.mock('../services/list-public-tryout-events.service', () => ({
  listPublicTryoutEvents: vi.fn(),
}));
vi.mock('../services/register-candidate.service', () => ({ registerCandidate: vi.fn() }));

const OPEN = buildTryoutEvent({ tryoutId: 'open-1', name: 'Autumn intake' });
const FULL = buildTryoutEvent({
  tryoutId: 'full-1',
  name: 'Autumn intake two',
  capacity: 2,
  registeredCount: 2,
});

function render() {
  return renderHookWithProviders(() => usePublicTryouts());
}

/** Fill the minimum a real application needs, then consent. */
function completeForm(view: PublicTryoutsView): void {
  view.form.name.onChange('Sara Nabil');
  view.form.email.onChange('sara@example.test');
  view.form.onConsentChange(true);
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  vi.mocked(listPublicTryoutEvents).mockResolvedValue({ items: [OPEN, FULL], total: 2 });
  vi.mocked(registerCandidate).mockResolvedValue({
    outcome: 'registered',
    reference: 'UN-2026-0099',
    consentVersion: 'tryout-consent-v1',
  });
});

describe('usePublicTryouts', () => {
  it('lists every open session with its Cairo date and capacity', async () => {
    const { result } = render();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.cards).toHaveLength(2);
    expect(result.current.cards[0]?.whenValue).toContain('2026');
    expect(result.current.cards[1]?.isFull).toBe(true);
  });

  it('carries its own SEO metadata and canonical path', async () => {
    const { result } = render();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.seoTitle).toContain('Tryouts');
    expect(result.current.seoDescription).not.toBe('');
    expect(result.current.path).toBe('/tryout-registration');
  });

  it('preselects the first open session and repoints the form when another is picked', async () => {
    const { result } = render();

    await waitFor(() => {
      expect(result.current.cards[0]?.isSelected).toBe(true);
    });
    act(() => {
      result.current.cards[1]?.onApply();
    });

    await waitFor(() => {
      expect(result.current.cards[1]?.isSelected).toBe(true);
    });
    expect(result.current.form.intro).toContain('Autumn intake two');
    expect(result.current.form.capacityNotice).not.toBeNull();
  });

  it('sends exactly the registration command the contract defines', async () => {
    const { result } = render();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    act(() => {
      completeForm(result.current);
    });
    await waitFor(() => {
      expect(result.current.form.canSubmit).toBe(true);
    });
    act(() => {
      result.current.form.onSubmit();
    });

    await waitFor(() => {
      expect(registerCandidate).toHaveBeenCalledWith({
        tryoutId: 'open-1',
        fullName: 'Sara Nabil',
        preferredName: null,
        email: 'sara@example.test',
        phone: null,
        birthYear: null,
        consentVersion: 'v1',
        consentGiven: true,
      });
    });
  });

  it('shows the confirmation once the server answers, and can start over', async () => {
    const { result } = render();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    act(() => {
      completeForm(result.current);
    });
    act(() => {
      result.current.form.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.outcome?.reference).toBe('UN-2026-0099');
    });
    act(() => {
      result.current.outcome?.onReset();
    });

    await waitFor(() => {
      expect(result.current.outcome).toBeNull();
    });
    expect(result.current.form.name.value).toBe('');
  });

  it('reports a duplicate as a duplicate rather than a confirmed place', async () => {
    vi.mocked(registerCandidate).mockResolvedValue({
      outcome: 'duplicate',
      reference: null,
      consentVersion: 'v1',
    });
    const { result } = render();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    act(() => {
      completeForm(result.current);
    });
    act(() => {
      result.current.form.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.outcome?.tone).toBe('medium');
    });
    expect(result.current.outcome?.title).toBe('Already registered');
  });

  it('says nothing was saved when the call fails, and keeps the form filled', async () => {
    vi.mocked(registerCandidate).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));
    const { result } = render();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    act(() => {
      completeForm(result.current);
    });
    act(() => {
      result.current.form.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.form.statusMessage).toContain('not sent');
    });
    expect(result.current.outcome).toBeNull();
    expect(result.current.form.name.value).toBe('Sara Nabil');
  });

  it('presents the designed empty state when no session is open', async () => {
    vi.mocked(listPublicTryoutEvents).mockResolvedValue({ items: [], total: 0 });
    const { result } = render();

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
    expect(result.current.emptyTitle).toBe('No open tryouts right now');
  });

  it('presents the error state with a retry when the list fails', async () => {
    vi.mocked(listPublicTryoutEvents).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Server }),
    );
    const { result } = render();

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.retryLabel).not.toBe('');
    expect(typeof result.current.onRetry).toBe('function');
  });

  it('presents the offline state rather than an error when the device is offline', async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    vi.mocked(listPublicTryoutEvents).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.NetworkOffline }),
    );
    const { result } = render();

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });
  });

  it('offers the three reassurance steps in every state', async () => {
    const { result } = render();

    await waitFor(() => {
      expect(result.current.steps).toHaveLength(3);
    });
    expect(result.current.stepsHeading).toBe('What happens next');
  });
});
