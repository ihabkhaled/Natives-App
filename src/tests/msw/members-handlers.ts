import { http, HttpResponse } from 'msw';

import type { MemberRole } from '@/modules/members';

import { apiUrl } from './mock-request.helper';
import {
  addAliasRecord,
  attachAvatarRecord,
  avatarAccessResponse,
  avatarTicketResponse,
  buildDirectoryResponse,
  getMemberView,
  historyResponse,
  inviteMemberRecord,
  listAliasesResponse,
  removeAliasRecord,
  rolesResponse,
  setRolesRecord,
  transitionRecord,
  updateProfileRecord,
  type Actor,
} from './members.fixture';
import { nestErrorResponse } from './nest-error.helper';

interface ProfileBody {
  readonly profile?: { fullName?: string; nickname?: string; jerseyNumber?: number };
  readonly expectedVersion?: number;
}

function toProfilePatch(body: ProfileBody): {
  fullName: string;
  nickname: string | null;
  jerseyNumber: number | null;
  expectedVersion: number;
} {
  const profile = body.profile ?? {};
  return {
    fullName: profile.fullName ?? '',
    nickname: profile.nickname ?? null,
    jerseyNumber: profile.jerseyNumber ?? null,
    expectedVersion: body.expectedVersion ?? 1,
  };
}

const TRANSITION_STATUS: Record<string, 'active' | 'inactive' | 'suspended' | 'left' | 'archived'> =
  {
    activate: 'active',
    deactivate: 'inactive',
    suspend: 'suspended',
    leave: 'left',
    archive: 'archived',
  };

function resolveActor(request: Request): Actor | null {
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ') || auth.length <= 'Bearer '.length) {
    return null;
  }
  if (auth.includes('user-member')) {
    return { tier: 'member', userId: 'user-member' };
  }
  if (auth.includes('user-coach')) {
    return { tier: 'coach', userId: 'user-coach' };
  }
  return { tier: 'admin', userId: 'user-1' };
}

function fail(status: number, code: string, path: string): Response {
  return nestErrorResponse({ statusCode: status, code, message: code, path: `/api/v1${path}` });
}

function membersUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId/members${suffix}`);
}

function param(params: Record<string, unknown>, key: string): string {
  return String(params[key]);
}

async function readJson<T>(request: Request): Promise<T> {
  return (await request.json().catch(() => ({}))) as T;
}

const directoryHandlers = [
  http.get(membersUrl(''), ({ request }) => {
    if (resolveActor(request) === null) {
      return fail(401, 'UNAUTHORIZED', '/members');
    }
    const url = new URL(request.url);
    const limit = Number.parseInt(url.searchParams.get('limit') ?? '20', 10);
    const offset = Number.parseInt(url.searchParams.get('offset') ?? '0', 10);
    return HttpResponse.json(buildDirectoryResponse(limit, offset));
  }),
  http.post(membersUrl('/invite'), async ({ request }) => {
    const actor = resolveActor(request);
    if (actor?.tier !== 'admin') {
      return fail(actor === null ? 401 : 403, 'FORBIDDEN', '/members/invite');
    }
    const body = await readJson<ProfileBody>(request);
    const profile = body.profile ?? { fullName: 'New Member' };
    return HttpResponse.json(
      inviteMemberRecord(
        profile.fullName ?? 'New Member',
        profile.nickname ?? null,
        profile.jerseyNumber ?? null,
      ),
      { status: 201 },
    );
  }),
  http.get(membersUrl('/:membershipId'), ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor === null) {
      return fail(401, 'UNAUTHORIZED', `/members/${id}`);
    }
    const view = getMemberView(id, actor.tier, actor.userId);
    return view === null ? fail(404, 'NOT_FOUND', `/members/${id}`) : HttpResponse.json(view);
  }),
  http.patch(membersUrl('/:membershipId/profile'), async ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor === null) {
      return fail(401, 'UNAUTHORIZED', `/members/${id}/profile`);
    }
    const body = await readJson<ProfileBody>(request);
    const result = updateProfileRecord(id, toProfilePatch(body), actor);
    if (result === 'not-found') {
      return fail(404, 'NOT_FOUND', `/members/${id}/profile`);
    }
    return result === 'conflict'
      ? fail(409, 'CONFLICT', `/members/${id}/profile`)
      : HttpResponse.json(result);
  }),
  http.get(membersUrl('/:membershipId/history'), ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor?.tier !== 'admin') {
      return fail(actor === null ? 401 : 403, 'FORBIDDEN', `/members/${id}/history`);
    }
    return HttpResponse.json(historyResponse(id));
  }),
];

const aliasHandlers = [
  http.get(membersUrl('/:membershipId/aliases'), ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor === null || actor.tier === 'member') {
      return fail(actor === null ? 401 : 403, 'FORBIDDEN', `/members/${id}/aliases`);
    }
    return HttpResponse.json(listAliasesResponse(id));
  }),
  http.post(membersUrl('/:membershipId/aliases'), async ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor === null || actor.tier === 'member') {
      return fail(actor === null ? 401 : 403, 'FORBIDDEN', `/members/${id}/aliases`);
    }
    const body = await readJson<{ alias?: string }>(request);
    const result = addAliasRecord(id, body.alias ?? '');
    return result === 'conflict'
      ? fail(409, 'CONFLICT', `/members/${id}/aliases`)
      : HttpResponse.json(result, { status: 201 });
  }),
  http.delete(membersUrl('/:membershipId/aliases/:aliasId'), ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor === null || actor.tier === 'member') {
      return fail(actor === null ? 401 : 403, 'FORBIDDEN', `/members/${id}/aliases`);
    }
    removeAliasRecord(id, param(params, 'aliasId'));
    return new HttpResponse(null, { status: 204 });
  }),
];

const roleHandlers = [
  http.get(membersUrl('/:membershipId/roles'), ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor === null || actor.tier === 'member') {
      return fail(actor === null ? 401 : 403, 'FORBIDDEN', `/members/${id}/roles`);
    }
    return HttpResponse.json(rolesResponse(id, actor.tier));
  }),
  http.put(membersUrl('/:membershipId/roles'), async ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor === null || actor.tier === 'member') {
      return fail(actor === null ? 401 : 403, 'FORBIDDEN', `/members/${id}/roles`);
    }
    const body = await readJson<{ roles?: MemberRole[] }>(request);
    return HttpResponse.json(setRolesRecord(id, body.roles ?? [], actor.tier));
  }),
];

const avatarHandlers = [
  http.post(membersUrl('/:membershipId/avatar'), ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor === null) {
      return fail(401, 'UNAUTHORIZED', `/members/${id}/avatar`);
    }
    return HttpResponse.json(avatarTicketResponse(id), { status: 201 });
  }),
  http.put(membersUrl('/:membershipId/avatar/:mediaId'), ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    if (actor === null) {
      return fail(401, 'UNAUTHORIZED', `/members/${id}/avatar`);
    }
    const result = attachAvatarRecord(id, actor.tier, actor.userId);
    return result === 'not-found'
      ? fail(404, 'NOT_FOUND', `/members/${id}/avatar`)
      : HttpResponse.json(result);
  }),
  http.get(membersUrl('/:membershipId/avatar'), ({ request, params }) => {
    const id = param(params, 'membershipId');
    return resolveActor(request) === null
      ? fail(401, 'UNAUTHORIZED', `/members/${id}/avatar`)
      : HttpResponse.json(avatarAccessResponse(id));
  }),
];

const transitionHandler = http.post(
  membersUrl('/:membershipId/:action'),
  async ({ request, params }) => {
    const actor = resolveActor(request);
    const id = param(params, 'membershipId');
    const action = param(params, 'action');
    const status = TRANSITION_STATUS[action];
    if (status === undefined) {
      return fail(404, 'NOT_FOUND', `/members/${id}/${action}`);
    }
    if (actor?.tier !== 'admin') {
      return fail(actor === null ? 401 : 403, 'FORBIDDEN', `/members/${id}/${action}`);
    }
    const body = await readJson<{ reason?: string }>(request);
    const result = transitionRecord(id, status, body.reason ?? null);
    return result === 'not-found'
      ? fail(404, 'NOT_FOUND', `/members/${id}/${action}`)
      : HttpResponse.json(result);
  },
);

/** NestJS-shaped member directory, profile, lifecycle, roles, and media handlers. */
export const membersHandlers = [
  ...directoryHandlers,
  ...aliasHandlers,
  ...roleHandlers,
  ...avatarHandlers,
  transitionHandler,
];
