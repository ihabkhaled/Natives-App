import { assert, describe, expect, it } from 'vitest';

import {
  memberDirectoryListResponseSchema,
  memberHistoryResponseSchema,
  memberRolesResponseSchema,
  membershipResponseSchema,
  memberViewResponseSchema,
} from '@/modules/members';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_PERSONA_EMAILS, MOCK_PRACTICE } from '@/tests/msw/mock-data.constants';

import { apiUrl, authGet, loginAs } from '../setup/contract-api.helper';

const TEAM = MOCK_PRACTICE.teamId;

function membersPath(suffix = ''): string {
  return `/teams/${TEAM}/members${suffix}`;
}

describe('members wire contract (mock mode = remote contract)', () => {
  it('serves the bounded directory envelope', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authGet(`${membersPath()}?limit=20&offset=0`, token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(memberDirectoryListResponseSchema, await response.json());
    assert(parsed.success, 'directory page violated ListMembersResponseDto');
    expect(parsed.data.limit).toBe(20);
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('shapes the profile to the viewer audience', async () => {
    const adminToken = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const adminView = safeParseWithSchema(
      memberViewResponseSchema,
      await (await authGet(membersPath('/mem-omar'), adminToken)).json(),
    );
    assert(adminView.success, 'admin view violated MemberViewResponseDto');
    expect(adminView.data.email).toBe('omar@example.com');

    const memberToken = await loginAs(MOCK_PERSONA_EMAILS.member);
    const teammateView = safeParseWithSchema(
      memberViewResponseSchema,
      await (await authGet(membersPath('/mem-nadia'), memberToken)).json(),
    );
    assert(teammateView.success, 'teammate view violated MemberViewResponseDto');
    expect(teammateView.data.audience).toBe('teammate');
    expect(teammateView.data.email).toBeNull();
  });

  it('runs a lifecycle transition and records history', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await fetch(apiUrl(membersPath('/mem-lina/activate')), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason: 'return' }),
    });
    expect(response.status).toBe(200);
    const membership = safeParseWithSchema(membershipResponseSchema, await response.json());
    assert(membership.success, 'transition violated MembershipResponseDto');
    expect(membership.data.status).toBe('active');

    const history = safeParseWithSchema(
      memberHistoryResponseSchema,
      await (await authGet(membersPath('/mem-lina/history'), token)).json(),
    );
    assert(history.success, 'history violated MemberHistoryResponseDto');
    expect(history.data.items.length).toBeGreaterThan(0);
  });

  it('exposes the actor role ceiling', async () => {
    const coachToken = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const roles = safeParseWithSchema(
      memberRolesResponseSchema,
      await (await authGet(membersPath('/mem-omar/roles'), coachToken)).json(),
    );
    assert(roles.success, 'roles violated MemberRolesResponseDto');
    expect(roles.data.assignableRoles).not.toContain('team_admin');
  });

  /**
   * Contract-drift guard for the P0 invitation repair.
   *
   * The app writes the invited address into `profile.email` because acceptance
   * claims an invited membership by matching that column. If the server ever
   * drops the field, validation strips it silently: the request still returns
   * 201, the membership is still created, and nothing fails — but every
   * invitee from then on lands with an account and no team. The generated
   * contract is the only place that regression is visible before production.
   */
  it('keeps profile.email in the generated invite contract', async () => {
    const contract = (await import('../../contracts/openapi.json')).default as {
      components: { schemas: Record<string, { properties?: Record<string, unknown> }> };
    };
    const profile = contract.components.schemas['PlayerProfileDto']?.properties;

    expect(profile).toBeDefined();
    expect(profile).toHaveProperty('email');
  });

  it('accepts an invite body carrying the invited email', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await fetch(apiUrl(membersPath('/invite')), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        profile: { fullName: 'Contract Recruit', email: 'contract.recruit@example.com' },
      }),
    });
    expect(response.status).toBe(201);

    const membership = safeParseWithSchema(membershipResponseSchema, await response.json());
    assert(membership.success, 'invite violated MembershipResponseDto');
    expect(membership.data.status).toBe('invited');
  });

  it('forbids invite for a member persona and rejects anonymous reads', async () => {
    const memberToken = await loginAs(MOCK_PERSONA_EMAILS.member);
    const forbidden = await fetch(apiUrl(membersPath('/invite')), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${memberToken}` },
      body: JSON.stringify({ profile: { fullName: 'X' } }),
    });
    expect(forbidden.status).toBe(403);

    const anonymous = await fetch(apiUrl(membersPath()));
    expect(anonymous.status).toBe(401);
  });
});
