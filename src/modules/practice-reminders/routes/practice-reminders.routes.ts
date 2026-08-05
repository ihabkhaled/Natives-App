import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { PracticeRemindersContainer } from '../containers/practice-reminders.container';
import { practiceRemindersPattern } from './practice-reminders.paths';

/**
 * Reminder state and sending for one session.
 *
 * Gated on `practice.manage`, unlike the agenda's `practice.read`: who has not
 * replied is roster information, and mailing them is a coach's action. The
 * backend re-authorizes every call regardless.
 */
export function getPracticeRemindersRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: practiceRemindersPattern(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: PracticeRemindersContainer,
      meta: {
        key: 'practice-reminders',
        titleKey: I18N_KEYS.practiceReminders.title,
        permissions: [PERMISSIONS.practicesManage],
        requiresTeamContext: true,
        // Sending is a write against a live queue; an offline shell would only
        // be able to show a stale count next to a button that cannot work.
        offline: false,
        preload: false,
        featureFlag: null,
        // Session-scoped: a sidebar item cannot resolve which session to open,
        // so the entry point is the session detail screen.
        nav: null,
      },
    },
  ];
}
