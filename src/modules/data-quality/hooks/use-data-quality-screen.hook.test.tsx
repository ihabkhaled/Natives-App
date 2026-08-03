// jscpd:ignore-start
// vitest hoists a vi.mock factory to the top of the file that declares it,
// so neither the factory nor the imports it needs can move into a shared
// helper. Only the payloads could, and they now come from
// tests/setup/screen-grants.helper.ts.
import {
  buildEffectivePermissions,
  buildTeamScope,
} from '../../../../tests/setup/screen-grants.helper';
import { act, waitFor } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { MOCK_ANOMALIES } from '@/tests/msw/data-quality.fixture';

import { listAnomalies } from '../services/list-anomalies.service';
import { previewRepair } from '../services/preview-repair.service';
import { runScan } from '../services/run-scan.service';
import { transitionAnomaly } from '../services/transition-anomaly.service';
import { useDataQualityScreen } from './use-data-quality-screen.hook';

vi.mock('../services/list-anomalies.service', () => ({ listAnomalies: vi.fn() }));
vi.mock('../services/preview-repair.service', () => ({ previewRepair: vi.fn() }));
vi.mock('../services/transition-anomaly.service', () => ({ transitionAnomaly: vi.fn() }));
vi.mock('../services/run-scan.service', () => ({ runScan: vi.fn() }));

vi.mock('@/platform', () => createPlatformMock());
vi.mock('@/modules/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthModule>();
  return { ...actual, useActiveTeamScope: vi.fn(), useEffectivePermissions: vi.fn() };
});
// jscpd:ignore-end

/** The queue is one grant: data_quality.manage covers reviewing and repairing. */
function mockGrants(
  permissions: readonly string[] = [PERMISSIONS.dataQualityManage],
  isLoading = false,
): void {
  vi.mocked(useActiveTeamScope).mockReturnValue(buildTeamScope({ isLoading }));
  vi.mocked(useEffectivePermissions).mockReturnValue(buildEffectivePermissions(permissions));
}

function renderScreen(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useDataQualityScreen>>
> {
  return renderHookWithProviders(() => useDataQualityScreen(), { initialPath: '/data-quality' });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  mockGrants();
  vi.mocked(listAnomalies).mockResolvedValue({
    items: [...MOCK_ANOMALIES],
    total: 3,
    limit: 25,
    offset: 0,
  });
  vi.mocked(previewRepair).mockResolvedValue({
    anomalyId: 'anomaly-1',
    repairKind: 'merge_duplicate_jersey',
    impactCount: 4,
    impactSummary: 'Four roster entries would be renumbered.',
    reversible: true,
  });
  vi.mocked(transitionAnomaly).mockResolvedValue({} as never);
  vi.mocked(runScan).mockResolvedValue({} as never);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useDataQualityScreen', () => {
  it('starts loading so the screen can render its skeleton', () => {
    const { result } = renderScreen();

    expect(result.current.status).toBe('loading');
  });

  it('becomes ready with the queue ordered worst first', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.cards.map((card) => card.severity)).toEqual([
      'critical',
      'medium',
      'low',
    ]);
  });

  it('reports the server total rather than the page length', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.countLabel).toContain('3');
  });

  it('offers a scan and no notice until something fails', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.notice).toBeNull();
    expect(result.current.scanLabel).toBe('Run a scan');
  });

  it('shows the repair preview only once an operator asks for it', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.preview).toBeNull();

    result.current.onPreview('anomaly-1');

    await waitFor(() => {
      expect(result.current.preview?.repairKind).toBe('merge_duplicate_jersey');
    });
  });

  it('says plainly when the previewed repair can be undone', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    result.current.onPreview('anomaly-1');

    await waitFor(() => {
      expect(result.current.preview?.reversibilityLabel).toBe(
        'This can be undone after it is applied.',
      );
    });
  });

  it('sends the card’s own record version with a transition', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    act(() => {
      result.current.onTransition('anomaly-2', 'resolve');
    });

    // anomaly-2 is at version 2 in the fixture; sending the card's version is
    // what lets the server refuse a move another operator already made.
    await waitFor(() => {
      expect(transitionAnomaly).toHaveBeenCalledWith(
        expect.objectContaining({ anomalyId: 'anomaly-2', expectedRecordVersion: 2 }),
      );
    });
  });

  it('runs a scan on request', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    act(() => {
      result.current.onScan();
    });

    await waitFor(() => {
      expect(runScan).toHaveBeenCalledWith('team-1');
    });
  });

  it('says it is scanning while the scan is in flight', async () => {
    vi.mocked(runScan).mockImplementation(() => new Promise(() => undefined));
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    act(() => {
      result.current.onScan();
    });

    await waitFor(() => {
      expect(result.current.scanLabel).toBe('Scanning…');
    });
    expect(result.current.isScanning).toBe(true);
  });

  it('ignores a transition for an anomaly that is no longer on the page', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(() => {
      result.current.onTransition('gone', 'acknowledge');
    }).not.toThrow();
  });

  it('waits rather than refusing while the grants are still resolving', () => {
    mockGrants([], true);
    const { result } = renderScreen();

    // Forbidden is a verdict, not a default: showing it before the grants
    // land would accuse a permitted operator of having no access.
    expect(result.current.status).toBe('loading');
  });

  it('refuses the queue without the data-quality grant', () => {
    mockGrants([]);
    const { result } = renderScreen();

    expect(result.current.status).toBe('forbidden');
  });

  it('carries translated copy for every designed non-ready state', () => {
    const { result } = renderScreen();

    // The error block is the shared one every screen uses; only the empty
    // state is written for this queue.
    expect(result.current.emptyTitle).toBe('Nothing to review');
    expect(result.current.emptyMessage).toBe('No anomaly is open. Run a scan if you expect one.');
  });

  it('keeps showing a resolved queue through an offline blip', async () => {
    const { result } = renderScreen();
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });

    // Cached data survives losing the connection: an operator mid-triage is
    // not thrown back to an offline screen.
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
  });

  it('blames the connection, not the server, when the read fails offline', async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    vi.mocked(listAnomalies).mockRejectedValue(new Error('offline'));
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });
  });
});
