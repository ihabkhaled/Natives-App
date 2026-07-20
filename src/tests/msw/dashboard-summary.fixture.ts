import type { AuthUser } from '@/modules/auth';
import {
  DASHBOARD_WIDGET_KIND,
  type DashboardPersona,
  type dashboardSummaryResponseSchema,
  type DashboardWidgetTone,
} from '@/modules/dashboard';
import type { SchemaOutput } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';

type SummaryDto = SchemaOutput<typeof dashboardSummaryResponseSchema>;
type WidgetDto = SummaryDto['widgets'][number];
type TaskDto = NonNullable<Extract<WidgetDto, { presentation: 'tasks' }>['tasks']>[number];
type RowDto = NonNullable<Extract<WidgetDto, { presentation: 'breakdown' }>['rows']>[number];
type MetricDto = NonNullable<Extract<WidgetDto, { presentation: 'metric' }>['metric']>;
type WidgetStatus = WidgetDto['status'];

interface TaskSpec {
  readonly id: string;
  readonly labelKey: string;
  readonly count?: number | null;
  readonly tone?: DashboardWidgetTone;
  readonly occurredAt?: string | null;
}

const GENERATED_AT = '2026-07-18T09:00:00.000Z';
const AS_OF = '2026-07-18T08:00:00.000Z';

function task(spec: TaskSpec): TaskDto {
  return {
    id: spec.id,
    labelKey: spec.labelKey,
    count: spec.count ?? null,
    tone: spec.tone ?? 'neutral',
    occurredAt: spec.occurredAt ?? null,
  };
}

function row(
  key: string,
  labelKey: string,
  value: number | null,
  displayValue: string | null,
): RowDto {
  return { key, labelKey, value, displayValue };
}

function metric(
  value: number | null,
  displayValue: string | null,
  unit: MetricDto['unit'],
  tone: DashboardWidgetTone,
): MetricDto {
  return { value, displayValue, unit, tone };
}

function tasksWidget(
  kind: string,
  tasks: readonly TaskDto[],
  status: WidgetStatus = 'ready',
  asOf: string | null = AS_OF,
): WidgetDto {
  return { kind, presentation: 'tasks', status, asOf, tasks: [...tasks] };
}

function breakdownWidget(kind: string, rows: readonly RowDto[]): WidgetDto {
  return { kind, presentation: 'breakdown', status: 'ready', asOf: AS_OF, rows: [...rows] };
}

function metricWidget(kind: string, value: MetricDto): WidgetDto {
  return { kind, presentation: 'metric', status: 'ready', asOf: AS_OF, metric: value };
}

const MEMBER_WIDGETS: readonly WidgetDto[] = [
  tasksWidget(DASHBOARD_WIDGET_KIND.memberSchedule, [
    task({
      id: 'm-practice',
      labelKey: I18N_KEYS.dashboard.taskConfirmPractice,
      tone: 'attention',
      occurredAt: '2026-07-20T17:00:00.000Z',
    }),
    task({
      id: 'm-match',
      labelKey: I18N_KEYS.dashboard.taskRsvpMatch,
      occurredAt: '2026-07-22T18:00:00.000Z',
    }),
  ]),
  breakdownWidget(DASHBOARD_WIDGET_KIND.memberAttendance, [
    row('present', I18N_KEYS.dashboard.attendancePresent, 8, '8'),
    row('late', I18N_KEYS.dashboard.attendanceLate, 1, '1'),
    row('excused', I18N_KEYS.dashboard.attendanceExcused, 2, '2'),
    row('absent', I18N_KEYS.dashboard.attendanceAbsent, 0, '0'),
  ]),
  metricWidget(DASHBOARD_WIDGET_KIND.memberStanding, metric(null, null, 'rank', 'neutral')),
  metricWidget(DASHBOARD_WIDGET_KIND.memberActivity, metric(14, '14', 'points', 'positive')),
  tasksWidget(DASHBOARD_WIDGET_KIND.memberFeedback, [
    task({
      id: 'm-feedback',
      labelKey: I18N_KEYS.dashboard.taskReviewFeedback,
      occurredAt: '2026-07-15T10:00:00.000Z',
    }),
    task({
      id: 'm-notify',
      labelKey: I18N_KEYS.dashboard.taskCheckNotifications,
      count: 2,
      tone: 'attention',
    }),
  ]),
  metricWidget(DASHBOARD_WIDGET_KIND.memberProfile, metric(80, '80', 'percent', 'attention')),
];

const COACH_WIDGETS: readonly WidgetDto[] = [
  tasksWidget(DASHBOARD_WIDGET_KIND.coachSessions, [
    task({
      id: 'c-plan',
      labelKey: I18N_KEYS.dashboard.taskPlanSession,
      tone: 'attention',
      occurredAt: '2026-07-19T17:00:00.000Z',
    }),
    task({ id: 'c-tryout', labelKey: I18N_KEYS.dashboard.taskReviewTryout, count: 3 }),
  ]),
  tasksWidget(DASHBOARD_WIDGET_KIND.coachAttention, [
    task({
      id: 'c-rsvp',
      labelKey: I18N_KEYS.dashboard.taskCloseRsvpGaps,
      count: 5,
      tone: 'critical',
    }),
    task({
      id: 'c-attend',
      labelKey: I18N_KEYS.dashboard.taskFinalizeAttendance,
      count: 1,
      tone: 'attention',
      occurredAt: '2026-07-17T19:00:00.000Z',
    }),
  ]),
  tasksWidget(DASHBOARD_WIDGET_KIND.coachAssessments, [
    task({
      id: 'c-assess',
      labelKey: I18N_KEYS.dashboard.taskCompleteAssessments,
      count: 4,
      tone: 'attention',
    }),
    task({ id: 'c-activity', labelKey: I18N_KEYS.dashboard.taskReviewActivity, count: 2 }),
  ]),
  tasksWidget(DASHBOARD_WIDGET_KIND.coachRoster, [
    task({
      id: 'c-roster',
      labelKey: I18N_KEYS.dashboard.taskUpdateRoster,
      occurredAt: '2026-07-21T17:00:00.000Z',
    }),
  ]),
  tasksWidget(
    DASHBOARD_WIDGET_KIND.coachDataQuality,
    [
      task({
        id: 'c-data',
        labelKey: I18N_KEYS.dashboard.taskResolveDataGaps,
        count: 3,
        tone: 'attention',
      }),
    ],
    'partial',
    null,
  ),
];

const ADMIN_WIDGETS: readonly WidgetDto[] = [
  tasksWidget(DASHBOARD_WIDGET_KIND.adminLifecycle, [
    task({
      id: 'a-invite',
      labelKey: I18N_KEYS.dashboard.taskReviewInvitations,
      count: 6,
      tone: 'attention',
    }),
    task({ id: 'a-stale', labelKey: I18N_KEYS.dashboard.taskDeactivateStale, count: 2 }),
  ]),
  tasksWidget(DASHBOARD_WIDGET_KIND.adminConfig, [
    task({
      id: 'a-rules',
      labelKey: I18N_KEYS.dashboard.taskPublishRules,
      tone: 'attention',
      occurredAt: '2026-07-16T09:00:00.000Z',
    }),
    task({ id: 'a-config', labelKey: I18N_KEYS.dashboard.taskReviewConfig, count: 1 }),
  ]),
  tasksWidget(DASHBOARD_WIDGET_KIND.adminOperations, [
    task({
      id: 'a-import',
      labelKey: I18N_KEYS.dashboard.taskProcessImport,
      count: 1,
      tone: 'attention',
    }),
    task({
      id: 'a-delivery',
      labelKey: I18N_KEYS.dashboard.taskRetryDeliveries,
      count: 4,
      tone: 'critical',
    }),
  ]),
  tasksWidget(DASHBOARD_WIDGET_KIND.adminSecurity, [], 'unavailable', null),
];

const WIDGETS_BY_PERSONA: Record<DashboardPersona, readonly WidgetDto[]> = {
  member: MEMBER_WIDGETS,
  coach: COACH_WIDGETS,
  administrator: ADMIN_WIDGETS,
};

/** Classify the persona from effective grants; the widget set follows from it. */
function personaFor(user: AuthUser): DashboardPersona {
  const granted = new Set(user.permissions);
  if (granted.has(PERMISSIONS.usersManage)) {
    return 'administrator';
  }
  if (granted.has(PERMISSIONS.practicesManage) || granted.has(PERMISSIONS.assessmentsManage)) {
    return 'coach';
  }
  return 'member';
}

/** Deterministic, NestJS-shaped summary projection for the resolved persona. */
export function buildDashboardSummaryResponse(user: AuthUser): SummaryDto {
  const persona = personaFor(user);
  return {
    persona,
    generatedAt: GENERATED_AT,
    widgets: [...WIDGETS_BY_PERSONA[persona]],
  };
}
