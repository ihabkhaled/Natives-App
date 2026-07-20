import { vi } from 'vitest';

import type {
  DashboardBreakdownRowView,
  DashboardBreakdownWidgetView,
  DashboardMetricView,
  DashboardMetricWidgetView,
  DashboardTasksWidgetView,
  DashboardTaskView,
  DashboardView,
} from '@/modules/dashboard/types/dashboard-view.types';
import { TEST_IDS } from '@/shared/config';

const WIDGET = TEST_IDS.dashboardWidget;

export function buildDashboardMetricView(
  overrides: Partial<DashboardMetricView> = {},
): DashboardMetricView {
  return {
    valueText: '82',
    hasValue: true,
    unitLabel: 'percent complete',
    color: 'success',
    ...overrides,
  };
}

export function buildDashboardTaskView(
  overrides: Partial<DashboardTaskView> = {},
): DashboardTaskView {
  return {
    id: 'task-1',
    label: 'Confirm attendance for the next practice',
    countText: null,
    color: 'medium',
    timeText: null,
    ...overrides,
  };
}

export function buildDashboardBreakdownRowView(
  overrides: Partial<DashboardBreakdownRowView> = {},
): DashboardBreakdownRowView {
  return { key: 'present', label: 'Present', valueText: '8', hasValue: true, ...overrides };
}

export function buildMetricWidgetView(
  overrides: Partial<DashboardMetricWidgetView> = {},
): DashboardMetricWidgetView {
  return {
    presentation: 'metric',
    kind: 'member-standing',
    testId: `${WIDGET}-member-standing`,
    title: 'Your standing',
    freshnessLabel: 'As of July 18, 2026',
    showsContent: true,
    stateKind: null,
    stateLabel: '',
    stateMessage: null,
    partialLabel: null,
    metric: buildDashboardMetricView(),
    ...overrides,
  };
}

export function buildTasksWidgetView(
  overrides: Partial<DashboardTasksWidgetView> = {},
): DashboardTasksWidgetView {
  return {
    presentation: 'tasks',
    kind: 'member-schedule',
    testId: `${WIDGET}-member-schedule`,
    title: 'Your next sessions',
    freshnessLabel: 'As of July 18, 2026',
    showsContent: true,
    stateKind: null,
    stateLabel: '',
    stateMessage: null,
    partialLabel: null,
    emptyTasksLabel: 'Nothing here yet.',
    tasks: [buildDashboardTaskView()],
    ...overrides,
  };
}

export function buildBreakdownWidgetView(
  overrides: Partial<DashboardBreakdownWidgetView> = {},
): DashboardBreakdownWidgetView {
  return {
    presentation: 'breakdown',
    kind: 'member-attendance',
    testId: `${WIDGET}-member-attendance`,
    title: 'Attendance summary',
    freshnessLabel: 'As of July 18, 2026',
    showsContent: true,
    stateKind: null,
    stateLabel: '',
    stateMessage: null,
    partialLabel: null,
    caption: 'Attendance summary',
    rows: [buildDashboardBreakdownRowView()],
    ...overrides,
  };
}

export function buildDashboardView(overrides: Partial<DashboardView> = {}): DashboardView {
  return {
    title: 'Your dashboard',
    updatedLabel: 'Updated July 18, 2026',
    status: 'ready',
    loadingLabel: 'Loading…',
    errorTitle: 'Something went wrong',
    errorMessage: 'Please try again.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to load the latest data.',
    offlineNoticeLabel: 'Showing your last saved dashboard.',
    isOffline: false,
    emptyTitle: 'Nothing to show yet',
    emptyMessage: 'No cards for your role yet.',
    widgets: [buildTasksWidgetView()],
    ...overrides,
  };
}
