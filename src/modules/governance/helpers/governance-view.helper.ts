import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { TASK_CLOSED_STATUSES, TASK_PRIORITIES } from '../constants/governance.constants';
import type {
  GovernanceMeeting,
  GovernanceMeetingsPage,
  GovernanceTask,
  GovernanceTasksPage,
  MeetingStatus,
  MeetingVisibility,
  TaskPriority,
  TaskStatus,
} from '../types/governance.types';
import type { MeetingCardView, TaskCardView } from '../types/governance-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

const KEYS = I18N_KEYS.governance;

const MEETING_STATUS_KEYS: Readonly<Record<MeetingStatus, string>> = {
  scheduled: KEYS.statusScheduled,
  held: KEYS.statusHeld,
  minuted: KEYS.statusMinuted,
  approved: KEYS.statusApproved,
  cancelled: KEYS.statusCancelled,
};

const VISIBILITY_KEYS: Readonly<Record<MeetingVisibility, string>> = {
  public: KEYS.visibilityPublic,
  team: KEYS.visibilityTeam,
  staff: KEYS.visibilityStaff,
  board: KEYS.visibilityBoard,
};

const PRIORITY_KEYS: Readonly<Record<TaskPriority, string>> = {
  urgent: KEYS.priorityUrgent,
  high: KEYS.priorityHigh,
  normal: KEYS.priorityNormal,
  low: KEYS.priorityLow,
};

const TASK_STATUS_KEYS: Readonly<Record<TaskStatus, string>> = {
  open: KEYS.taskStatusOpen,
  in_progress: KEYS.taskStatusInProgress,
  blocked: KEYS.taskStatusBlocked,
  completed: KEYS.taskStatusCompleted,
  cancelled: KEYS.taskStatusCancelled,
};

/** Soonest first: a board reads what is coming, not what has passed. */
function bySchedule(left: GovernanceMeeting, right: GovernanceMeeting): number {
  return left.scheduledAt.localeCompare(right.scheduledAt);
}

/**
 * Board meetings as cards.
 *
 * `minutesApprovedAt` decides the minutes line rather than `status`: a meeting
 * can be marked minuted while its minutes still await approval, and a decision
 * is only quotable once they are approved.
 */
export function buildMeetingCardViews(
  t: Translate,
  meetings: readonly GovernanceMeeting[],
): readonly MeetingCardView[] {
  return [...meetings].sort(bySchedule).map((meeting) => ({
    id: meeting.meetingId,
    title: meeting.title,
    statusLabel: t(MEETING_STATUS_KEYS[meeting.status]),
    visibilityLabel: t(KEYS.visibilityLabel),
    visibilityCaption: t(VISIBILITY_KEYS[meeting.visibility]),
    scheduledLabel: t(KEYS.scheduledLabel),
    scheduledAt: meeting.scheduledAt,
    decisionsLabel: meeting.decisions.length === 0 ? t(KEYS.noDecisions) : t(KEYS.decisionsLabel),
    decisions: meeting.decisions,
    minutesLabel:
      meeting.minutesApprovedAt === null ? t(KEYS.minutesPending) : t(KEYS.minutesApproved),
    isMinutesApproved: meeting.minutesApprovedAt !== null,
  }));
}

/** Open work before closed work; within each, the most urgent first. */
function byUrgency(left: GovernanceTask, right: GovernanceTask): number {
  const leftClosed = TASK_CLOSED_STATUSES.includes(left.status);
  const rightClosed = TASK_CLOSED_STATUSES.includes(right.status);
  if (leftClosed !== rightClosed) {
    return leftClosed ? 1 : -1;
  }
  return TASK_PRIORITIES.indexOf(left.priority) - TASK_PRIORITIES.indexOf(right.priority);
}

/**
 * Tasks as cards. A blocked task says what it is waiting on, so the board
 * chases the dependency rather than the owner.
 */
export function buildTaskCardViews(
  t: Translate,
  tasks: readonly GovernanceTask[],
): readonly TaskCardView[] {
  return [...tasks].sort(byUrgency).map((task) => ({
    id: task.taskId,
    title: task.title,
    description: task.description,
    priorityLabel: t(PRIORITY_KEYS[task.priority]),
    statusLabel: t(TASK_STATUS_KEYS[task.status]),
    dueLabel: task.dueDate === null ? t(KEYS.noDueDate) : t(KEYS.dueLabel),
    dueDate: task.dueDate,
    blockedNotice: task.dependsOnTaskId === null ? null : t(KEYS.blockedNotice),
    isClosed: TASK_CLOSED_STATUSES.includes(task.status),
  }));
}

/** The meetings page, defaulted once so the screen never reads it twice. */
export function resolveMeetingsPage(page: GovernanceMeetingsPage | undefined): {
  readonly items: readonly GovernanceMeeting[];
  readonly total: number;
  readonly hasData: boolean;
} {
  return { items: page?.items ?? [], total: page?.total ?? 0, hasData: page !== undefined };
}

/** The tasks page, defaulted the same way. */
export function resolveTasksPage(page: GovernanceTasksPage | undefined): {
  readonly items: readonly GovernanceTask[];
  readonly total: number;
  readonly hasData: boolean;
} {
  return { items: page?.items ?? [], total: page?.total ?? 0, hasData: page !== undefined };
}
