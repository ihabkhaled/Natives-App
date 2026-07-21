import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { useEffectivePermissions, type EffectivePermissionsView } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { DASHBOARD_WIDGET_KIND } from '../constants/dashboard-widgets.constants';
import type { DashboardSummary, DashboardWidget } from '../types/dashboard.types';
import { useDashboard } from './use-dashboard.hook';
import {
  useDashboardSummaryQuery,
  type DashboardSummaryQueryView,
} from './use-dashboard-summary-query.hook';

vi.mock('./use-dashboard-summary-query.hook', () => ({ useDashboardSummaryQuery: vi.fn() }));
vi.mock('@/modules/auth', () => ({ useEffectivePermissions: vi.fn() }));
vi.mock('@/platform', () => ({ useNetworkStatus: vi.fn() }));

const MEMBER_PERMISSIONS = [
  PERMISSIONS.memberList,
  PERMISSIONS.practicesRead,
  PERMISSIONS.leaderboardsRead,
];

const ATTENDANCE_WIDGET: DashboardWidget = {
  kind: DASHBOARD_WIDGET_KIND.memberAttendance,
  presentation: 'breakdown',
  status: 'ready',
  asOfIso: '2026-07-18T08:00:00.000Z',
  rows: [{ key: 'present', labelKey: 'dashboard.attendancePresent', value: 8, displayValue: '8' }],
};

const ADMIN_WIDGET: DashboardWidget = {
  kind: DASHBOARD_WIDGET_KIND.adminLifecycle,
  presentation: 'tasks',
  status: 'ready',
  asOfIso: null,
  tasks: [
    {
      id: 'a',
      labelKey: 'dashboard.taskReviewInvitations',
      count: 6,
      tone: 'attention',
      occurredAtIso: null,
    },
  ],
};

function summaryWith(widgets: readonly DashboardWidget[]): DashboardSummary {
  return { persona: 'member', generatedAtIso: '2026-07-18T09:00:00.000Z', widgets };
}

function mockQuery(overrides: Partial<DashboardSummaryQueryView> = {}): void {
  vi.mocked(useDashboardSummaryQuery).mockReturnValue({
    summary: undefined,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  });
}

function mockPermissions(overrides: Partial<EffectivePermissionsView> = {}): void {
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: MEMBER_PERMISSIONS,
    accountActive: true,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

function mockNetwork(isOnline = true): void {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline });
}

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useDashboard', () => {
  it('reports the loading state before the summary resolves', () => {
    mockQuery({ isLoading: true });
    mockPermissions();
    mockNetwork();

    const { result } = renderHook(() => useDashboard());

    expect(result.current.status).toBe('loading');
    expect(result.current.title).toBe('Your dashboard');
  });

  it('shows the persona headline and freshness once the summary resolves', () => {
    mockQuery({ summary: summaryWith([ATTENDANCE_WIDGET]) });
    mockPermissions();
    mockNetwork();

    const { result } = renderHook(() => useDashboard());

    expect(result.current.status).toBe('ready');
    expect(result.current.title).toBe('Your dashboard');
    expect(result.current.updatedLabel).toContain('Updated');
    expect(result.current.updatedLabel).toContain('2026');
    expect(result.current.widgets).toHaveLength(1);
  });

  it('drops widgets the effective session lacks permission to see', () => {
    mockQuery({ summary: summaryWith([ATTENDANCE_WIDGET, ADMIN_WIDGET]) });
    mockPermissions();
    mockNetwork();

    const { result } = renderHook(() => useDashboard());

    const kinds = result.current.widgets.map((widget) => widget.kind);
    expect(kinds).toEqual([DASHBOARD_WIDGET_KIND.memberAttendance]);
  });

  it('reports empty when no visible widgets remain after filtering', () => {
    mockQuery({ summary: summaryWith([ADMIN_WIDGET]) });
    mockPermissions();
    mockNetwork();

    const { result } = renderHook(() => useDashboard());

    expect(result.current.status).toBe('empty');
  });

  it('maps a failure to sanitized translated copy, never the raw message', () => {
    mockQuery({ error: new AppError({ code: APP_ERROR_CODE.Server, message: 'ECONNREFUSED' }) });
    mockPermissions();
    mockNetwork();

    const { result } = renderHook(() => useDashboard());

    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('Something went wrong on our side. Please try again.');
    expect(result.current.errorMessage).not.toContain('ECONNREFUSED');
  });

  it('prefers a dedicated offline state when disconnected with no data', () => {
    mockQuery();
    mockPermissions();
    mockNetwork(false);

    const { result } = renderHook(() => useDashboard());

    expect(result.current.status).toBe('offline');
    expect(result.current.isOffline).toBe(true);
  });

  it('shows cached widgets with an offline notice when disconnected', () => {
    mockQuery({ summary: summaryWith([ATTENDANCE_WIDGET]) });
    mockPermissions();
    mockNetwork(false);

    const { result } = renderHook(() => useDashboard());

    expect(result.current.status).toBe('ready');
    expect(result.current.isOffline).toBe(true);
  });

  it('stays in the loading state while the effective permissions resolve', () => {
    mockQuery();
    mockPermissions({ isLoading: true, permissions: [] });
    mockNetwork();

    const { result } = renderHook(() => useDashboard());

    expect(result.current.status).toBe('loading');
  });
});
