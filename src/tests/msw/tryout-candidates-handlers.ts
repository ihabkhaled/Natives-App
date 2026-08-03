import { http, HttpResponse } from 'msw';

import type { TryoutCandidate } from '@/modules/tryout-candidates';
import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest, pathParam, readJsonBody, readPaging } from './mock-request.helper';
import { has, permissionsForRequest } from './persona-permissions.helper';
import { MOCK_TRYOUT_CANDIDATES, redactTryoutCandidate } from './tryout-candidates.fixture';

const BASE = '/teams/:teamId/tryout-candidates';

interface WithdrawBody {
  readonly reason?: string;
  readonly expectedRecordVersion?: number;
}

/**
 * The server, not the client, decides which fields a caller receives. A
 * reviewer without `tryout.contacts.read` gets a payload with no contact keys
 * at all — not nulls, not empty strings — so the client cannot tell "withheld"
 * from "blank" by accident, only by the field being absent.
 */
function redact(candidate: TryoutCandidate, granted: readonly string[]): Record<string, unknown> {
  return {
    ...redactTryoutCandidate(candidate),
    ...(granted.includes(PERMISSIONS.tryoutContactsRead)
      ? {
          contactChannel: candidate.contactChannel,
          contactReference: candidate.contactReference,
          communicationOptIn: candidate.communicationOptIn,
        }
      : {}),
    ...(granted.includes(PERMISSIONS.tryoutReadinessRead)
      ? { readiness: candidate.readiness, restrictedNotes: candidate.restrictedNotes }
      : {}),
  };
}

/** The record as it looks the moment a withdrawal is accepted. */
function withdrawn(candidate: TryoutCandidate): TryoutCandidate {
  return {
    ...candidate,
    status: 'withdrawn',
    withdrawnAt: '2026-08-03T09:00:00.000Z',
    recordVersion: candidate.recordVersion + 1,
    updatedAt: '2026-08-03T09:00:00.000Z',
  };
}

function findCandidate(candidateId: string): TryoutCandidate | undefined {
  return MOCK_TRYOUT_CANDIDATES.find((entry) => entry.candidateId === candidateId);
}

const listHandler = http.get(apiUrl(BASE), ({ request }) => {
  if (!has(request, PERMISSIONS.tryoutManage)) {
    return failRequest(403, 'FORBIDDEN', '/tryout-candidates');
  }
  const granted = permissionsForRequest(request);
  const paging = readPaging(request);
  return HttpResponse.json({
    items: MOCK_TRYOUT_CANDIDATES.map((entry) => redact(entry, granted)),
    total: MOCK_TRYOUT_CANDIDATES.length,
    limit: paging.limit,
    offset: paging.offset,
  });
});

const detailHandler = http.get(apiUrl(`${BASE}/:candidateId`), ({ request, params }) => {
  if (!has(request, PERMISSIONS.tryoutManage)) {
    return failRequest(403, 'FORBIDDEN', '/tryout-candidates');
  }
  const found = findCandidate(pathParam(params, 'candidateId'));
  return found === undefined
    ? failRequest(404, 'NOT_FOUND', '/tryout-candidates')
    : HttpResponse.json(redact(found, permissionsForRequest(request)));
});

/**
 * Withdrawal refuses a stale record version rather than overwriting it: two
 * reviewers working the same queue is the normal case, and a 409 is how the
 * second one learns the first got there.
 */
const withdrawalHandler = http.post(
  apiUrl(`${BASE}/:candidateId/withdrawal`),
  async ({ request, params }) => {
    if (!has(request, PERMISSIONS.tryoutManage)) {
      return failRequest(403, 'FORBIDDEN', '/tryout-candidates/withdrawal');
    }
    const body = await readJsonBody<WithdrawBody>(request);
    const found = findCandidate(pathParam(params, 'candidateId'));
    if (found === undefined) {
      return failRequest(404, 'NOT_FOUND', '/tryout-candidates/withdrawal');
    }
    if (body.reason === undefined || body.reason.length < 3) {
      return failRequest(400, 'VALIDATION_ERROR', '/tryout-candidates/withdrawal');
    }
    return body.expectedRecordVersion === found.recordVersion
      ? HttpResponse.json(redact(withdrawn(found), permissionsForRequest(request)))
      : failRequest(409, 'CONFLICT', '/tryout-candidates/withdrawal');
  },
);

const retentionHandler = http.post(apiUrl(`${BASE}/retention`), ({ request }) => {
  if (!has(request, PERMISSIONS.tryoutManage)) {
    return failRequest(403, 'FORBIDDEN', '/tryout-candidates/retention');
  }
  const expired = MOCK_TRYOUT_CANDIDATES.filter((entry) => entry.anonymizedAt !== null);
  return HttpResponse.json({
    examined: MOCK_TRYOUT_CANDIDATES.length,
    anonymized: expired.length,
    candidateIds: expired.map((entry) => entry.candidateId),
  });
});

/**
 * NestJS-shaped tryout-candidate handlers. `tryout.manage` opens every route;
 * the contact and readiness fields need their own grants on top and are simply
 * absent without them.
 *
 * Retention is declared before the `:candidateId` routes so the literal path
 * wins the match.
 */
export const tryoutCandidatesHandlers = [
  retentionHandler,
  listHandler,
  detailHandler,
  withdrawalHandler,
];
