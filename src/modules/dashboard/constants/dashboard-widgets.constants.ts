import { APP_PATHS, type AppPath } from '@/shared/config';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';
import { PERMISSIONS, type Permission } from '@/shared/security';

import type { DashboardPersona } from '../types/dashboard.types';

/**
 * Stable widget identifiers (kebab-case). The backend summary names widgets
 * with these values; the client uses them for the typed registry, the widget
 * test id, and permission gating. Unknown kinds are dropped, never rendered.
 */
export const DASHBOARD_WIDGET_KIND = {
  memberSchedule: 'member-schedule',
  memberAttendance: 'member-attendance',
  memberStanding: 'member-standing',
  memberActivity: 'member-activity',
  memberFeedback: 'member-feedback',
  memberProfile: 'member-profile',
  coachSessions: 'coach-sessions',
  coachAttention: 'coach-attention',
  coachAssessments: 'coach-assessments',
  coachRoster: 'coach-roster',
  coachDataQuality: 'coach-data-quality',
  adminLifecycle: 'admin-lifecycle',
  adminConfig: 'admin-config',
  adminOperations: 'admin-operations',
  adminSecurity: 'admin-security',
} as const;

export type DashboardWidgetKind =
  (typeof DASHBOARD_WIDGET_KIND)[keyof typeof DASHBOARD_WIDGET_KIND];

/** A widget footer deep link into the surface that owns the widget's fact. */
interface DashboardWidgetLinkDescriptor {
  readonly linkPath: AppPath;
  readonly linkLabelKey: I18nKey;
  /** The TARGET route's permission; the link hides when it is not held. */
  readonly linkPermission: Permission;
}

/** Registry entry: the client owns the title and the permission a widget needs. */
export interface DashboardWidgetDescriptor {
  readonly titleKey: I18nKey;
  /** Permission the effective session must hold, or null when member-visible. */
  readonly permission: Permission | null;
  /** Footer deep link, or null when the widget has no owning screen yet. */
  readonly link: DashboardWidgetLinkDescriptor | null;
}

/**
 * Typed widget registry. Every widget the summary can return is declared here
 * with its translated title and the permission that reveals it. There is no
 * monolithic per-persona component: personas differ only by which registered
 * widgets their grants unlock.
 */
export const DASHBOARD_WIDGET_REGISTRY: Record<string, DashboardWidgetDescriptor> = {
  [DASHBOARD_WIDGET_KIND.memberSchedule]: {
    titleKey: I18N_KEYS.dashboard.memberScheduleTitle,
    permission: PERMISSIONS.practicesRead,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.memberAttendance]: {
    titleKey: I18N_KEYS.dashboard.memberAttendanceTitle,
    permission: null,
    link: {
      linkPath: APP_PATHS.myAttendance,
      linkLabelKey: I18N_KEYS.dashboard.memberAttendanceLink,
      linkPermission: PERMISSIONS.attendanceReadSelf,
    },
  },
  [DASHBOARD_WIDGET_KIND.memberStanding]: {
    titleKey: I18N_KEYS.dashboard.memberStandingTitle,
    permission: PERMISSIONS.leaderboardsRead,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.memberActivity]: {
    titleKey: I18N_KEYS.dashboard.memberActivityTitle,
    permission: null,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.memberFeedback]: {
    titleKey: I18N_KEYS.dashboard.memberFeedbackTitle,
    permission: null,
    link: {
      linkPath: APP_PATHS.performanceFeedback,
      linkLabelKey: I18N_KEYS.dashboard.memberFeedbackLink,
      linkPermission: PERMISSIONS.feedbackReadSelf,
    },
  },
  [DASHBOARD_WIDGET_KIND.memberProfile]: {
    titleKey: I18N_KEYS.dashboard.memberProfileTitle,
    permission: null,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.coachSessions]: {
    titleKey: I18N_KEYS.dashboard.coachSessionsTitle,
    permission: PERMISSIONS.practicesRead,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.coachAttention]: {
    titleKey: I18N_KEYS.dashboard.coachAttentionTitle,
    permission: PERMISSIONS.attendanceMark,
    link: {
      linkPath: APP_PATHS.practices,
      linkLabelKey: I18N_KEYS.dashboard.coachAttentionLink,
      linkPermission: PERMISSIONS.practicesRead,
    },
  },
  [DASHBOARD_WIDGET_KIND.coachAssessments]: {
    titleKey: I18N_KEYS.dashboard.coachAssessmentsTitle,
    permission: PERMISSIONS.assessmentReview,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.coachRoster]: {
    titleKey: I18N_KEYS.dashboard.coachRosterTitle,
    permission: PERMISSIONS.memberList,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.coachDataQuality]: {
    titleKey: I18N_KEYS.dashboard.coachDataQualityTitle,
    permission: PERMISSIONS.practicesManage,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.adminLifecycle]: {
    titleKey: I18N_KEYS.dashboard.adminLifecycleTitle,
    permission: PERMISSIONS.memberLifecycleManage,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.adminConfig]: {
    titleKey: I18N_KEYS.dashboard.adminConfigTitle,
    permission: PERMISSIONS.memberLifecycleManage,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.adminOperations]: {
    titleKey: I18N_KEYS.dashboard.adminOperationsTitle,
    permission: PERMISSIONS.reportsGenerate,
    link: null,
  },
  [DASHBOARD_WIDGET_KIND.adminSecurity]: {
    titleKey: I18N_KEYS.dashboard.adminSecurityTitle,
    permission: PERMISSIONS.memberLifecycleManage,
    link: null,
  },
};

/** Persona headline shown above the widget grid. */
export const DASHBOARD_PERSONA_TITLE_KEYS: Record<DashboardPersona, I18nKey> = {
  member: I18N_KEYS.dashboard.memberTitle,
  coach: I18N_KEYS.dashboard.coachTitle,
  administrator: I18N_KEYS.dashboard.adminTitle,
};
