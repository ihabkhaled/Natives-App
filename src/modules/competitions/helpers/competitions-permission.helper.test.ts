import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import {
  canManageCompetitions,
  canManageSquads,
  canOverrideEligibility,
  canReadCompetitions,
  canReadRoster,
  canReadSquads,
} from './competitions-permission.helper';

const MEMBER = [PERMISSIONS.competitionRead, PERMISSIONS.squadRead, PERMISSIONS.rosterRead];
const COACH = [...MEMBER, PERMISSIONS.competitionManage, PERMISSIONS.squadManage];
const ADMIN = [...COACH, PERMISSIONS.squadOverrideEligibility];

describe('competitions permission helpers', () => {
  it('lets a member read but never manage', () => {
    expect(canReadCompetitions(MEMBER)).toBe(true);
    expect(canReadSquads(MEMBER)).toBe(true);
    expect(canReadRoster(MEMBER)).toBe(true);
    expect(canManageCompetitions(MEMBER)).toBe(false);
    expect(canManageSquads(MEMBER)).toBe(false);
  });

  it('lets a coach manage without granting the eligibility override', () => {
    expect(canManageSquads(COACH)).toBe(true);
    expect(canManageCompetitions(COACH)).toBe(true);
    expect(canOverrideEligibility(COACH)).toBe(false);
  });

  it('grants the override only with its own permission', () => {
    expect(canOverrideEligibility(ADMIN)).toBe(true);
  });

  it('denies everything to a principal with no grants at all', () => {
    expect(canReadCompetitions([])).toBe(false);
    expect(canReadSquads([])).toBe(false);
    expect(canReadRoster([])).toBe(false);
  });
});
