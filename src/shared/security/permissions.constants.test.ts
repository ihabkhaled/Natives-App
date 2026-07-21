import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from './permissions.constants';

const VALUES = Object.values(PERMISSIONS);

describe('PERMISSIONS', () => {
  it('exposes dotted, lower-case canonical permission strings', () => {
    // The catalog convention is `<area>.<resource>.<action>[.<qualifier>]`,
    // and an action may itself be snake_case (`squad.override_eligibility`).
    // Upper case, digits, spaces, and empty segments stay rejected.
    const isWord = (word: string): boolean => /^[a-z]+$/u.test(word);
    const isSegment = (segment: string): boolean => segment.split('_').every(isWord);
    const malformed = VALUES.filter((value) => {
      const segments = value.split('.');
      return segments.length < 2 || segments.some((segment) => !isSegment(segment));
    });

    expect(malformed).toEqual([]);
  });

  it('keeps every permission string unique', () => {
    expect(new Set(VALUES).size).toBe(VALUES.length);
  });

  it('pins the admin-only capability the shell keys navigation on', () => {
    expect(PERMISSIONS.memberLifecycleManage).toBe('member.lifecycle.manage');
  });

  it('pins the grants whose backend spelling the shell previously got wrong', () => {
    // Each of these once carried a string the backend never emits, which reads
    // as "not granted" and silently forbade the screen it gates. See
    // tests/contract/permissions.contract.test.ts for the standing guard.
    expect(PERMISSIONS.practicesRead).toBe('practice.read');
    expect(PERMISSIONS.practicesManage).toBe('practice.manage');
    expect(PERMISSIONS.practicesRsvpSelf).toBe('practice.rsvp.self');
    expect(PERMISSIONS.attendanceMark).toBe('attendance.record');
    expect(PERMISSIONS.settingsRead).toBe('team.settings.read');
    expect(PERMISSIONS.settingsManage).toBe('team.settings.manage');
    expect(PERMISSIONS.pointsRuleManage).toBe('points.rules.manage');
    expect(PERMISSIONS.outboxManage).toBe('jobs.manage');
  });

  it('pins the squad and tryout grants the selection and privacy rules key on', () => {
    expect(PERMISSIONS.squadOverrideEligibility).toBe('squad.override_eligibility');
    expect(PERMISSIONS.tryoutContactsRead).toBe('tryout.contacts.read');
    expect(PERMISSIONS.tryoutReadinessRead).toBe('tryout.readiness.read');
  });
});
