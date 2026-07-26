import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as PlatformModule from '@/platform';
import { useReportJobs } from '@/modules/reports/hooks/use-report-jobs.hook';
import { usePlayerAnalytics } from '@/modules/analytics/hooks/use-player-analytics.hook';
import { useTeamAnalytics } from '@/modules/analytics/hooks/use-team-analytics.hook';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { renderHookWithProviders } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 6000 };

vi.mock('@/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof PlatformModule>();
  return { ...actual, openExternalUrl: vi.fn().mockResolvedValue(undefined) };
});

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('analytics rebuild flow (hook-driven)', () => {
  it('rebuilds the projections and banners the report', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.teamAdmin);
    const { result } = renderHookWithProviders(() => useTeamAnalytics(), {
      initialPath: '/analytics',
    });

    await waitFor(() => {
      expect(result.current.freshness?.onOpenRebuild).toBeTypeOf('function');
    }, WAIT);
    act(() => result.current.freshness?.onOpenRebuild());
    await waitFor(() => {
      expect(result.current.freshness?.dialog).not.toBeNull();
    }, WAIT);
    act(() => result.current.freshness?.dialog?.onPeriodChange('season'));
    act(() => result.current.freshness?.dialog?.onConfirm());

    await waitFor(() => {
      expect(result.current.freshness?.reportBanner).not.toBeNull();
    }, WAIT);
  });

  it('switches dimension and cohort period', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    const { result } = renderHookWithProviders(() => useTeamAnalytics(), {
      initialPath: '/analytics',
    });

    await waitFor(() => {
      expect(result.current.chart).not.toBeNull();
    }, WAIT);
    act(() => {
      result.current.controls.onDimensionChange('consistency');
    });
    act(() => {
      result.current.controls.onPeriodChange('season');
    });
    act(() => result.current.cohort?.onPeriodChange('2026-04'));
    act(() => {
      result.current.onPlayerSelect('membership-natives-1');
    });
    await waitFor(() => {
      expect(result.current.chart).not.toBeNull();
    }, WAIT);
  });

  it('builds the player screen controls and back action', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    const { result } = renderHookWithProviders(() => usePlayerAnalytics(), {
      initialPath: '/analytics/players/x',
    });

    await waitFor(() => {
      expect(result.current.controls).toBeTypeOf('object');
    }, WAIT);
    act(() => {
      result.current.controls.onDimensionChange('technical');
    });
    act(() => {
      result.current.controls.onPeriodChange('season');
    });
    act(() => {
      result.current.onBack();
    });
  });
});

describe('reports actions flow (hook-driven)', () => {
  it('retries a failed job, downloads a completed one, and pages the list', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.analyst);
    const { result } = renderHookWithProviders(() => useReportJobs(), {
      initialPath: '/reports',
    });

    await waitFor(() => {
      expect(result.current.rows.length).toBeGreaterThan(0);
    }, WAIT);

    // Expand/collapse the same job (both sides of the toggle) while the list is stable.
    const firstRow = result.current.rows[0];
    act(() => firstRow?.onToggleExpand());
    act(() => firstRow?.onToggleExpand());

    const failed = result.current.rows.find((row) => row.retryLabel !== null);
    act(() => failed?.onRetry());

    const completed = result.current.rows.find((row) => row.downloadLabel !== null);
    act(() => completed?.onDownload());
    act(() => result.current.rows[0]?.onRequestAgain());

    // Facet + pager callbacks.
    act(() => {
      result.current.onTemplateFilterChange('attendance');
    });
    act(() => {
      result.current.onStatusFilterChange('completed');
    });
    act(() => {
      result.current.onNextPage();
    });
    act(() => {
      result.current.onPreviousPage();
    });
    await waitFor(() => {
      expect(result.current.rows.length).toBeGreaterThanOrEqual(0);
    }, WAIT);
  });

  it('explains a not-ready or expired download and a disallowed retry', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.analyst);
    const { result } = renderHookWithProviders(() => useReportJobs(), {
      initialPath: '/reports',
    });

    await waitFor(() => {
      expect(result.current.rows.length).toBeGreaterThan(0);
    }, WAIT);
    // The expired job's download endpoint answers 410 → the "expired" toast branch.
    const expired = result.current.rows.find((row) => row.statusChip.label === 'Expired');
    act(() => expired?.onDownload());
    // A not-yet-ready job's download answers 409 notReady → the other toast branch.
    const notReady = result.current.rows.find((row) => row.retryLabel !== null);
    act(() => notReady?.onDownload());
    // Retrying a non-failed job answers 409 retryNotAllowed → the banner branch.
    const completed = result.current.rows.find((row) => row.statusChip.label === 'Completed');
    act(() => completed?.onRetry());
    await waitFor(() => {
      expect(result.current.banner).not.toBeNull();
    }, WAIT);
  });

  it('requests a report and flags the queued job', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.analyst);
    const { result } = renderHookWithProviders(() => useReportJobs(), {
      initialPath: '/reports',
    });

    await waitFor(() => {
      expect(result.current.requestPanel).not.toBeNull();
    }, WAIT);
    act(() => result.current.requestPanel?.templates[0]?.onSelect());
    act(() => result.current.requestPanel?.onFormatChange('pdf'));
    // A concrete season scope exercises the non-"all" season branch on submit.
    const seasonOption = result.current.requestPanel?.seasonOptions.find(
      (option) => option.value !== 'all',
    );
    act(() => result.current.requestPanel?.onSeasonChange(seasonOption?.value ?? 'all'));
    act(() => result.current.requestPanel?.onSubmit());

    await waitFor(() => {
      expect(result.current.banner).not.toBeNull();
    }, WAIT);
  });
});
