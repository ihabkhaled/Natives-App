import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import {
  canConvertTryouts,
  canDecideTryouts,
  canEvaluateTryouts,
  canManageTryouts,
  canReadTryoutContacts,
  canReadTryoutReadiness,
} from './tryouts-permission.helper';

const COACH = [PERMISSIONS.tryoutManage, PERMISSIONS.tryoutEvaluate];
const ADMIN = [
  ...COACH,
  PERMISSIONS.tryoutContactsRead,
  PERMISSIONS.tryoutReadinessRead,
  PERMISSIONS.tryoutDecide,
  PERMISSIONS.tryoutConvert,
];

describe('tryout permission helpers', () => {
  it('lets a coach run the day without reading restricted candidate data', () => {
    expect(canManageTryouts(COACH)).toBe(true);
    expect(canEvaluateTryouts(COACH)).toBe(true);
    expect(canReadTryoutContacts(COACH)).toBe(false);
    expect(canReadTryoutReadiness(COACH)).toBe(false);
    expect(canDecideTryouts(COACH)).toBe(false);
    expect(canConvertTryouts(COACH)).toBe(false);
  });

  it('grants the restricted reads and the decision/conversion powers separately', () => {
    expect(canReadTryoutContacts(ADMIN)).toBe(true);
    expect(canReadTryoutReadiness(ADMIN)).toBe(true);
    expect(canDecideTryouts(ADMIN)).toBe(true);
    expect(canConvertTryouts(ADMIN)).toBe(true);
  });

  it('denies everything without any grant', () => {
    expect(canManageTryouts([])).toBe(false);
    expect(canEvaluateTryouts([])).toBe(false);
  });
});
