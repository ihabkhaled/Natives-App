import { describe, expect, it } from 'vitest';

import { LIFECYCLE_ACTION, MEMBERSHIP_STATUS_VALUES } from '../constants/members.constants';
import { availableLifecycleActions, lifecycleActionTone } from './lifecycle-actions.helper';

describe('lifecycle-actions.helper', () => {
  it('offers actions for every status (anonymized none)', () => {
    for (const status of MEMBERSHIP_STATUS_VALUES) {
      const actions = availableLifecycleActions(status);
      expect(Array.isArray(actions)).toBe(true);
    }
    expect(availableLifecycleActions('anonymized')).toEqual([]);
    expect(availableLifecycleActions('active')).toContain(LIFECYCLE_ACTION.suspend);
    expect(availableLifecycleActions('archived')).toEqual([LIFECYCLE_ACTION.reactivate]);
  });

  it('maps action tones', () => {
    expect(lifecycleActionTone(LIFECYCLE_ACTION.activate)).toBe('primary');
    expect(lifecycleActionTone(LIFECYCLE_ACTION.deactivate)).toBe('secondary');
    expect(lifecycleActionTone(LIFECYCLE_ACTION.archive)).toBe('danger');
  });
});
