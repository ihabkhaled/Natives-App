import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { GUARD_STATUS, type GuardStatus } from './guard.constants';
import type { GuardPresentation } from './guarded-route.types';

/** Data-only mapping from a guard outcome to its render shape and copy keys. */
const PRESENTATION: Record<GuardStatus, GuardPresentation> = {
  [GUARD_STATUS.Loading]: { kind: 'loading' },
  [GUARD_STATUS.Allow]: { kind: 'allow' },
  [GUARD_STATUS.RedirectLogin]: { kind: 'redirect', redirectPath: APP_PATHS.login },
  [GUARD_STATUS.RedirectHome]: { kind: 'redirect', redirectPath: APP_PATHS.home },
  [GUARD_STATUS.Forbidden]: {
    kind: 'state',
    state: {
      iconName: 'lock',
      tone: 'warning',
      titleKey: I18N_KEYS.guard.forbiddenTitle,
      messageKey: I18N_KEYS.guard.forbiddenMessage,
      testId: TEST_IDS.guardForbidden,
    },
  },
  [GUARD_STATUS.AccountBlocked]: {
    kind: 'state',
    state: {
      iconName: 'warning',
      tone: 'danger',
      titleKey: I18N_KEYS.guard.accountBlockedTitle,
      messageKey: I18N_KEYS.guard.accountBlockedMessage,
      testId: TEST_IDS.guardAccountBlocked,
    },
  },
  [GUARD_STATUS.Onboarding]: {
    kind: 'state',
    state: {
      iconName: 'information',
      tone: 'neutral',
      titleKey: I18N_KEYS.guard.onboardingTitle,
      messageKey: I18N_KEYS.guard.onboardingMessage,
      testId: TEST_IDS.guardOnboarding,
    },
  },
  [GUARD_STATUS.NoTeam]: {
    kind: 'state',
    state: {
      iconName: 'person',
      tone: 'neutral',
      titleKey: I18N_KEYS.guard.teamRequiredTitle,
      messageKey: I18N_KEYS.guard.teamRequiredMessage,
      testId: TEST_IDS.guardTeamRequired,
    },
  },
};

export function presentGuardStatus(status: GuardStatus): GuardPresentation {
  return PRESENTATION[status];
}
