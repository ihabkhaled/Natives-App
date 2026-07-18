import { describe, expect, it } from 'vitest';

import { APP_PATHS, TEST_IDS } from '@/shared/config';

import { GUARD_STATUS } from './guard.constants';
import { presentGuardStatus } from './guard-presentation.helper';

describe('presentGuardStatus', () => {
  it('maps loading and allow to their bare render kinds', () => {
    expect(presentGuardStatus(GUARD_STATUS.Loading)).toEqual({ kind: 'loading' });
    expect(presentGuardStatus(GUARD_STATUS.Allow)).toEqual({ kind: 'allow' });
  });

  it('redirects login and home outcomes to their canonical paths', () => {
    expect(presentGuardStatus(GUARD_STATUS.RedirectLogin)).toEqual({
      kind: 'redirect',
      redirectPath: APP_PATHS.login,
    });
    expect(presentGuardStatus(GUARD_STATUS.RedirectHome)).toEqual({
      kind: 'redirect',
      redirectPath: APP_PATHS.home,
    });
  });

  it('renders the forbidden outcome as a warning state', () => {
    expect(presentGuardStatus(GUARD_STATUS.Forbidden)).toEqual({
      kind: 'state',
      state: {
        iconName: 'lock',
        tone: 'warning',
        titleKey: 'guard.forbiddenTitle',
        messageKey: 'guard.forbiddenMessage',
        testId: TEST_IDS.guardForbidden,
      },
    });
  });

  it('gives every blocking state a distinct test id', () => {
    const testIds = [
      GUARD_STATUS.Forbidden,
      GUARD_STATUS.AccountBlocked,
      GUARD_STATUS.Onboarding,
      GUARD_STATUS.NoTeam,
    ].map((status) => {
      const presentation = presentGuardStatus(status);
      return presentation.kind === 'state' ? presentation.state.testId : '';
    });

    expect(new Set(testIds).size).toBe(testIds.length);
    expect(testIds).toEqual([
      TEST_IDS.guardForbidden,
      TEST_IDS.guardAccountBlocked,
      TEST_IDS.guardOnboarding,
      TEST_IDS.guardTeamRequired,
    ]);
  });
});
