import { http, HttpResponse } from 'msw';

import { resolveActor, teamUrl } from './members-actor.helper';
import { assignableRolesResponse, classifyInviteRole } from './members-roles.fixture';
import { recordInvitationRequest } from './members.fixture';
import { apiUrl, failRequest, pathParam, readJsonBody } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';

/** RBAC refusal envelopes, mirroring the backend's stable message keys. */
const RBAC_INVITE_REFUSALS: Record<string, { status: number; code: string; messageKey: string }> = {
  unknown: { status: 404, code: 'ROLE_NOT_FOUND', messageKey: 'errors.rbac.roleNotFound' },
  protected: { status: 403, code: 'PROTECTED_ROLE', messageKey: 'errors.rbac.protectedRole' },
  'above-ceiling': {
    status: 403,
    code: 'ESCALATION_DENIED',
    messageKey: 'errors.rbac.escalationDenied',
  },
};

function inviteRoleRefusal(verdict: string): Response | null {
  const refusal = RBAC_INVITE_REFUSALS[verdict];
  if (refusal === undefined) {
    return null;
  }
  return nestErrorResponse({
    statusCode: refusal.status,
    code: refusal.code,
    message: refusal.messageKey,
    messageKey: refusal.messageKey,
    path: '/api/v1/invitations',
  });
}

/**
 * The team-scoped invitation (contract 1.2.0). Deliberately separate from the
 * team's member record: inviting a real person creates both, and the composer
 * calls this one first because it is the step that can legitimately be
 * refused — including a role above the inviter's ceiling.
 *
 * The address is recorded on the way through, because acceptance claims the
 * invited membership by matching it against the roster profile's email. A test
 * can then prove the two writes carry the same value.
 */
export const membersInviteHandlers = [
  http.post(teamUrl('/invitations'), async ({ request, params }) => {
    const actor = resolveActor(request);
    if (actor?.tier !== 'admin') {
      return failRequest(actor === null ? 401 : 403, 'FORBIDDEN', '/invitations');
    }
    const body = await readJsonBody<{ email?: string; teamRole?: string }>(request);
    const teamRole = body.teamRole ?? 'member';
    const refusal = inviteRoleRefusal(classifyInviteRole(actor.tier, teamRole));
    if (refusal !== null) {
      return refusal;
    }
    recordInvitationRequest(pathParam(params, 'teamId'), body.email ?? '');
    return HttpResponse.json(
      {
        id: 'invitation-mock-1',
        email: body.email ?? 'recruit@example.com',
        role: 'user',
        status: 'pending',
        teamId: pathParam(params, 'teamId'),
        teamRole,
        expiresAt: '2026-07-28T13:38:53.984Z',
        createdAt: '2026-07-21T13:38:53.984Z',
        token: 'mock-invitation-token-0123456789',
      },
      { status: 201 },
    );
  }),
  http.get(apiUrl('/rbac/teams/:teamId/assignable-roles'), ({ request, params }) => {
    const actor = resolveActor(request);
    if (actor === null || actor.tier === 'member') {
      return failRequest(actor === null ? 401 : 403, 'FORBIDDEN', '/assignable-roles');
    }
    return HttpResponse.json(assignableRolesResponse(pathParam(params, 'teamId'), actor.tier));
  }),
];
