import { describe, expect, it } from 'vitest';

import { APP_ICONS } from '@/packages/icons';
import { TEST_IDS } from '@/shared/config';
import type { I18nKey } from '@/shared/i18n';

import { toGuardInstruction } from './guard-instruction.helper';
import type { GuardPresentation } from './guarded-route.types';

function Screen(): React.JSX.Element {
  return <div>screen</div>;
}

const echo = (key: I18nKey): string => `t:${key}`;

describe('toGuardInstruction', () => {
  it('translates the loading label', () => {
    const instruction = toGuardInstruction({ kind: 'loading' }, Screen, echo);

    expect(instruction).toEqual({ kind: 'loading', label: 't:common.loading' });
  });

  it('carries a redirect path straight through', () => {
    const presentation: GuardPresentation = { kind: 'redirect', redirectPath: '/login' };

    expect(toGuardInstruction(presentation, Screen, echo)).toEqual({
      kind: 'redirect',
      to: '/login',
    });
  });

  it('resolves a state icon and translates its copy', () => {
    const presentation: GuardPresentation = {
      kind: 'state',
      state: {
        iconName: 'lock',
        tone: 'warning',
        titleKey: 'guard.forbiddenTitle',
        messageKey: 'guard.forbiddenMessage',
        testId: TEST_IDS.guardForbidden,
      },
    };

    expect(toGuardInstruction(presentation, Screen, echo)).toEqual({
      kind: 'state',
      icon: APP_ICONS.lock,
      tone: 'warning',
      title: 't:guard.forbiddenTitle',
      message: 't:guard.forbiddenMessage',
      testId: TEST_IDS.guardForbidden,
    });
  });

  it('hands back the screen component when access is allowed', () => {
    const instruction = toGuardInstruction({ kind: 'allow' }, Screen, echo);

    expect(instruction).toEqual({ kind: 'screen', Screen });
  });
});
