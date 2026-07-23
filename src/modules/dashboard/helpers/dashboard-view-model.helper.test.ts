import { assert, describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import { DASHBOARD_WIDGET_KIND } from '../constants/dashboard-widgets.constants';
import type { DashboardWidget } from '../types/dashboard.types';
import { buildDashboardWidgetViews, resolveDashboardStatus } from './dashboard-view-model.helper';

const t = (key: string): string => key;
const LOCALE = 'en';
const FULL_PERMISSIONS = Object.values(PERMISSIONS);

const WIDGETS: readonly DashboardWidget[] = [
  {
    kind: DASHBOARD_WIDGET_KIND.memberStanding,
    presentation: 'metric',
    status: 'ready',
    asOfIso: '2026-07-18T08:00:00.000Z',
    metric: { value: null, displayValue: null, unit: 'rank', tone: 'neutral' },
  },
  {
    kind: DASHBOARD_WIDGET_KIND.memberActivity,
    presentation: 'metric',
    status: 'ready',
    asOfIso: null,
    metric: { value: 14, displayValue: '14', unit: 'points', tone: 'positive' },
  },
  {
    kind: DASHBOARD_WIDGET_KIND.memberProfile,
    presentation: 'metric',
    status: 'partial',
    asOfIso: '2026-07-18T08:00:00.000Z',
    metric: { value: 80, displayValue: '80', unit: 'percent', tone: 'attention' },
  },
  {
    kind: DASHBOARD_WIDGET_KIND.memberActivity,
    presentation: 'metric',
    status: 'ready',
    asOfIso: '2026-07-18T08:00:00.000Z',
    metric: { value: 0, displayValue: '0', unit: null, tone: 'positive' },
  },
  {
    kind: DASHBOARD_WIDGET_KIND.memberAttendance,
    presentation: 'breakdown',
    status: 'empty',
    asOfIso: null,
    rows: [
      { key: 'present', labelKey: 'dashboard.attendancePresent', value: 8, displayValue: '8' },
      { key: 'fitness', labelKey: 'dashboard.attendanceLate', value: null, displayValue: null },
    ],
  },
  {
    kind: DASHBOARD_WIDGET_KIND.memberFeedback,
    presentation: 'tasks',
    status: 'unavailable',
    asOfIso: null,
    tasks: [
      {
        id: 't1',
        labelKey: 'dashboard.taskReviewFeedback',
        count: 2,
        tone: 'critical',
        occurredAtIso: '2026-07-15T10:00:00.000Z',
      },
      {
        id: 't2',
        labelKey: 'dashboard.taskCheckNotifications',
        count: null,
        tone: 'neutral',
        occurredAtIso: null,
      },
    ],
  },
];

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

describe('buildDashboardWidgetViews', () => {
  const views = buildDashboardWidgetViews(WIDGETS, FULL_PERMISSIONS, t, LOCALE);

  it('builds one view per permitted widget in order', () => {
    expect(views).toHaveLength(WIDGETS.length);
    expect(views[0]?.testId).toBe(`dashboard-widget-${DASHBOARD_WIDGET_KIND.memberStanding}`);
  });

  it('renders a null metric as "not enough data", never as zero', () => {
    const view = views[0];
    assert(view?.presentation === 'metric');

    expect(view.metric.valueText).toBe('dashboard.notEnoughData');
    expect(view.metric.hasValue).toBe(false);
    expect(view.metric.unitLabel).toBe('dashboard.unitRank');
    expect(view.metric.color).toBe('medium');
  });

  it('renders a projected metric with its unit and tone colour', () => {
    const view = views[1];
    assert(view?.presentation === 'metric');

    expect(view.metric.valueText).toBe('14');
    expect(view.metric.hasValue).toBe(true);
    expect(view.metric.unitLabel).toBe('dashboard.unitPoints');
    expect(view.metric.color).toBe('success');
    expect(view.freshnessLabel).toBeNull();
  });

  it('flags a partial widget and shows its content', () => {
    const view = views[2];
    assert(view?.presentation === 'metric');

    expect(view.showsContent).toBe(true);
    expect(view.partialLabel).toBe('dashboard.widgetPartial');
    expect(view.metric.unitLabel).toBe('dashboard.unitPercent');
    expect(view.metric.color).toBe('warning');
  });

  it('distinguishes a measured zero from a missing value', () => {
    const view = views[3];
    assert(view?.presentation === 'metric');

    expect(view.metric.valueText).toBe('0');
    expect(view.metric.hasValue).toBe(true);
    expect(view.metric.unitLabel).toBeNull();
    expect(view.freshnessLabel).toBe('dashboard.asOf');
  });

  it('builds an accessible breakdown that marks missing rows', () => {
    const view = views[4];
    assert(view?.presentation === 'breakdown');

    expect(view.showsContent).toBe(false);
    expect(view.stateLabel).toBe('dashboard.widgetEmpty');
    expect(view.caption).toBe('dashboard.memberAttendanceTitle');
    expect(view.rows[0]).toMatchObject({ valueText: '8', hasValue: true });
    expect(view.rows[1]).toMatchObject({ valueText: 'dashboard.noValue', hasValue: false });
  });

  it('builds tasks with count badges, tone colours, and times', () => {
    const view = views[5];
    assert(view?.presentation === 'tasks');

    expect(view.showsContent).toBe(false);
    expect(view.stateLabel).toBe('dashboard.widgetUnavailable');
    expect(view.tasks[0]).toMatchObject({ countText: '2', color: 'danger' });
    expect(view.tasks[0]?.timeText).not.toBeNull();
    expect(view.tasks[1]).toMatchObject({ countText: null, color: 'medium', timeText: null });
  });

  it('drops unknown widget kinds', () => {
    const unknown: DashboardWidget = {
      kind: 'totally-unknown',
      presentation: 'metric',
      status: 'ready',
      asOfIso: null,
      metric: { value: 1, displayValue: '1', unit: null, tone: 'neutral' },
    };

    expect(buildDashboardWidgetViews([unknown], FULL_PERMISSIONS, t, LOCALE)).toHaveLength(0);
  });

  it('drops permission-gated widgets the session lacks', () => {
    expect(
      buildDashboardWidgetViews([ADMIN_WIDGET], [PERMISSIONS.memberList], t, LOCALE),
    ).toHaveLength(0);
  });

  it('keeps a permission-gated widget the session holds', () => {
    expect(
      buildDashboardWidgetViews([ADMIN_WIDGET], [PERMISSIONS.memberLifecycleManage], t, LOCALE),
    ).toHaveLength(1);
  });

  it('resolves the footer deep link when the target route permission is held', () => {
    expect(views[4]?.link).toEqual({
      path: '/my-attendance',
      label: 'dashboard.memberAttendanceLink',
    });
    expect(views[5]?.link).toEqual({
      path: '/performance/feedback',
      label: 'dashboard.memberFeedbackLink',
    });
    expect(views[0]?.link).toBeNull();
  });

  it('hides the footer link when the viewer cannot open its target route', () => {
    const attendanceWidget = WIDGETS[4];
    assert(attendanceWidget !== undefined);
    const [view] = buildDashboardWidgetViews([attendanceWidget], [], t, LOCALE);

    expect(view?.link).toBeNull();
  });
});

describe('resolveDashboardStatus', () => {
  const base = {
    hasSummary: false,
    hasWidgets: false,
    isLoading: false,
    hasError: false,
    isOffline: false,
  };

  it('is ready when a summary has visible widgets', () => {
    expect(resolveDashboardStatus({ ...base, hasSummary: true, hasWidgets: true })).toBe('ready');
  });

  it('is empty when a summary has no visible widgets', () => {
    expect(resolveDashboardStatus({ ...base, hasSummary: true, hasWidgets: false })).toBe('empty');
  });

  it('prefers offline over loading and error when there is no summary', () => {
    expect(
      resolveDashboardStatus({ ...base, isOffline: true, isLoading: true, hasError: true }),
    ).toBe('offline');
  });

  it('is loading while fetching with no summary', () => {
    expect(resolveDashboardStatus({ ...base, isLoading: true })).toBe('loading');
  });

  it('is error when the fetch failed with no summary', () => {
    expect(resolveDashboardStatus({ ...base, hasError: true })).toBe('error');
  });

  it('falls back to empty when idle with no summary', () => {
    expect(resolveDashboardStatus(base)).toBe('empty');
  });
});
