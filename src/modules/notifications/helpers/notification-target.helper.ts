import { assessmentEntryPath } from '@/modules/assessments';
import { attendancePath } from '@/modules/attendance';
import { rosterDetailPath } from '@/modules/competitions';
import { memberProfilePath } from '@/modules/members';
import { practiceSessionPath } from '@/modules/practice';
import { PERMISSIONS, type Permission } from '@/shared/security';

import type { NotificationItem, NotificationTarget } from '../types/notifications.types';

interface TargetRule {
  readonly paramKey: string;
  readonly permissions: readonly Permission[];
  readonly build: (id: string) => string;
}

/**
 * The one place an event type becomes a destination. Every rule names the
 * identifier it needs and the grants the destination itself requires, so the
 * arrival check reads the same table the link was built from.
 */
const TARGET_RULES: Readonly<Record<string, TargetRule>> = {
  'practice.session.published': {
    paramKey: 'sessionId',
    permissions: [PERMISSIONS.practicesRead],
    build: (id) => practiceSessionPath(id),
  },
  'practice.session.cancelled': {
    paramKey: 'sessionId',
    permissions: [PERMISSIONS.practicesRead],
    build: (id) => practiceSessionPath(id),
  },
  'attendance.sheet.finalized': {
    paramKey: 'sessionId',
    permissions: [PERMISSIONS.attendanceMark],
    build: (id) => attendancePath(id),
  },
  'member.invited': {
    paramKey: 'membershipId',
    permissions: [PERMISSIONS.memberList],
    build: (id) => memberProfilePath(id),
  },
  'member.activated': {
    paramKey: 'membershipId',
    permissions: [PERMISSIONS.memberList],
    build: (id) => memberProfilePath(id),
  },
  'assessment.published': {
    paramKey: 'assessmentId',
    permissions: [PERMISSIONS.assessmentReadSelfPublished],
    build: (id) => assessmentEntryPath(id),
  },
  'roster.published': {
    paramKey: 'rosterId',
    permissions: [PERMISSIONS.rosterRead],
    build: (id) => rosterDetailPath(id),
  },
};

/**
 * Resolve where a notification points, or null when it points nowhere the app
 * can route to. Resolution is pure and never reads the target: it only turns
 * an identifier into a path plus the grants that path demands.
 */
export function resolveNotificationTarget(item: NotificationItem): NotificationTarget | null {
  const rule = TARGET_RULES[item.eventType];
  if (rule === undefined) {
    return null;
  }
  const id = item.params[rule.paramKey];
  if (id === undefined || id === '') {
    return null;
  }
  return { path: rule.build(id), permissions: rule.permissions };
}

/** Whether the effective grants still satisfy a resolved target. */
export function isTargetAuthorized(
  target: NotificationTarget,
  granted: readonly string[],
): boolean {
  return target.permissions.every((permission) => granted.includes(permission));
}
