import { act, waitFor } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';
import {
  MOCK_TRYOUT_CANDIDATES,
  redactTryoutCandidate as redacted,
} from '@/tests/msw/tryout-candidates.fixture';

import { mockTryoutCandidateReviewer } from '../../../../tests/factories/tryout-candidates-view.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { getTryoutCandidate } from '../services/get-tryout-candidate.service';
import { listTryoutCandidates } from '../services/list-tryout-candidates.service';
import { withdrawTryoutCandidate } from '../services/withdraw-tryout-candidate.service';
import { useTryoutCandidatesScreen } from './use-tryout-candidates-screen.hook';

vi.mock('../services/list-tryout-candidates.service', () => ({ listTryoutCandidates: vi.fn() }));
vi.mock('../services/get-tryout-candidate.service', () => ({ getTryoutCandidate: vi.fn() }));
vi.mock('../services/withdraw-tryout-candidate.service', () => ({
  withdrawTryoutCandidate: vi.fn(),
}));

/** Only the two scope hooks are doubled; the rest of auth stays real. */
async function doubledAuthModule(
  loadReal: () => Promise<typeof AuthModule>,
): Promise<typeof AuthModule> {
  return { ...(await loadReal()), useActiveTeamScope: vi.fn(), useEffectivePermissions: vi.fn() };
}

vi.mock('@/platform', () => createPlatformMock());
vi.mock('@/modules/auth', (importOriginal) => doubledAuthModule(importOriginal<typeof AuthModule>));

function renderScreen(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useTryoutCandidatesScreen>>
> {
  return renderHookWithProviders(() => useTryoutCandidatesScreen(), {
    initialPath: '/tryout-candidates',
  });
}

/** Renders, waits for the list, then opens one candidate's record. */
async function openCandidate(
  candidateId = 'candidate-1',
): Promise<ReturnType<typeof renderScreen>> {
  const view = renderScreen();
  await waitFor(() => {
    expect(view.result.current.status).toBe('ready');
  });
  act(() => {
    view.result.current.onSelect(candidateId);
  });
  await waitFor(() => {
    expect(view.result.current.detail).not.toBeNull();
  });
  return view;
}

/** Opens the withdrawal panel on the open record, writes a reason, and sends it. */
function submitWithdrawal(view: ReturnType<typeof renderScreen>): void {
  act(() => {
    view.result.current.detail?.onWithdraw();
  });
  act(() => {
    view.result.current.withdrawal?.onReasonChange('Asked us to remove them.');
  });
  act(() => {
    view.result.current.withdrawal?.onSubmit();
  });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  mockTryoutCandidateReviewer();
  vi.mocked(listTryoutCandidates).mockResolvedValue({
    items: MOCK_TRYOUT_CANDIDATES.map((entry) => redacted(entry)),
    total: 4,
    limit: 25,
    offset: 0,
  });
  vi.mocked(getTryoutCandidate).mockResolvedValue(redacted(MOCK_TRYOUT_CANDIDATES[0]!));
  vi.mocked(withdrawTryoutCandidate).mockResolvedValue(MOCK_TRYOUT_CANDIDATES[0]!);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useTryoutCandidatesScreen', () => {
  it('starts loading so the screen can render its skeleton', () => {
    expect(renderScreen().result.current.status).toBe('loading');
  });

  it('becomes ready with a row per candidate and the server total', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.rows).toHaveLength(4);
    expect(result.current.countLabel).toContain('4');
  });

  it('promises in the list copy exactly what the row type enforces', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.listPrivacyNotice).toBe(
      'Contact details and readiness notes never appear in this list.',
    );
  });

  it('opens nobody until a reviewer picks a candidate', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.detail).toBeNull();
    expect(getTryoutCandidate).not.toHaveBeenCalled();
  });

  it('reads the restricted record only for the person actually opened', async () => {
    await openCandidate();

    expect(getTryoutCandidate).toHaveBeenCalledExactlyOnceWith('team-1', 'candidate-1');
  });

  it('tells a reviewer the contact block is restricted, not empty', async () => {
    const { result } = await openCandidate();
    const contacts = result.current.detail?.blocks[0];

    expect(contacts?.isDisclosed).toBe(false);
    expect(contacts?.withheldTitle).toBe('Contact details are restricted');
    expect(contacts?.facts).toEqual([]);
  });

  it('discloses the contact block to a reviewer who holds the grant', async () => {
    mockTryoutCandidateReviewer({
      permissions: [PERMISSIONS.tryoutManage, PERMISSIONS.tryoutContactsRead],
    });
    vi.mocked(getTryoutCandidate).mockResolvedValue(MOCK_TRYOUT_CANDIDATES[0]!);
    const { result } = await openCandidate();

    expect(result.current.detail?.blocks[0]?.isDisclosed).toBe(true);
    expect(result.current.detail?.blocks[0]?.facts[0]?.value).toBe('nour@example.test');
  });

  it('keeps the block restricted when the grant is held but the server withheld it', async () => {
    mockTryoutCandidateReviewer({
      permissions: [PERMISSIONS.tryoutManage, PERMISSIONS.tryoutContactsRead],
    });
    const { result } = await openCandidate();

    expect(result.current.detail?.blocks[0]?.isDisclosed).toBe(false);
  });

  it('offers withdrawal only after the record is open', async () => {
    const { result } = await openCandidate();

    expect(result.current.withdrawal).toBeNull();
    expect(result.current.detail?.canWithdraw).toBe(true);

    act(() => {
      result.current.detail?.onWithdraw();
    });

    await waitFor(() => {
      expect(result.current.withdrawal?.subjectName).toBe('Nour El-Sayed');
    });
  });

  it('withdraws with the reason and record version the reviewer saw', async () => {
    const view = await openCandidate();
    submitWithdrawal(view);

    await waitFor(() => {
      expect(withdrawTryoutCandidate).toHaveBeenCalledWith(
        expect.objectContaining({ candidateId: 'candidate-1', expectedRecordVersion: 1 }),
      );
    });
  });

  it('hides withdrawal on a candidate who already left the funnel', async () => {
    vi.mocked(getTryoutCandidate).mockResolvedValue(redacted(MOCK_TRYOUT_CANDIDATES[2]!));
    const { result } = await openCandidate('candidate-3');

    expect(result.current.detail?.statusLabel).toBe('Withdrawn');
    expect(result.current.detail?.canWithdraw).toBe(false);
  });

  it('says a retention-anonymized record is anonymized, not registered', async () => {
    vi.mocked(getTryoutCandidate).mockResolvedValue(redacted(MOCK_TRYOUT_CANDIDATES[3]!));
    const { result } = await openCandidate('candidate-4');

    expect(result.current.detail?.statusLabel).toBe('Anonymized');
    expect(result.current.detail?.canWithdraw).toBe(false);
  });

  it('waits rather than refusing while the grants are still resolving', () => {
    mockTryoutCandidateReviewer({ permissions: [], isLoading: true });

    // Forbidden is a verdict, not a default: showing it before the grants land
    // would accuse a permitted reviewer of having no access.
    expect(renderScreen().result.current.status).toBe('loading');
  });

  it('refuses the queue without the tryout management grant', () => {
    mockTryoutCandidateReviewer({ permissions: [] });

    expect(renderScreen().result.current.status).toBe('forbidden');
  });

  it('carries translated copy for the designed empty state', async () => {
    vi.mocked(listTryoutCandidates).mockResolvedValue({
      items: [],
      total: 0,
      limit: 25,
      offset: 0,
    });
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
    expect(result.current.emptyTitle).toBe('No candidates yet');
  });

  it('blames the connection, not the server, when the read fails offline', async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    vi.mocked(listTryoutCandidates).mockRejectedValue(new Error('offline'));
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });
  });

  it('surfaces one sentence when a withdrawal fails, never the raw error', async () => {
    vi.mocked(withdrawTryoutCandidate).mockRejectedValue(new Error('constraint violation'));
    const view = await openCandidate();
    submitWithdrawal(view);

    await waitFor(() => {
      expect(view.result.current.notice).toBe('That action did not complete. Try again.');
    });
  });
});
