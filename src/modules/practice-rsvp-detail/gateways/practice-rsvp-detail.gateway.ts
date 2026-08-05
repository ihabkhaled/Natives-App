import { getAppHttpClient } from '@/packages/http';

import {
  rsvpHistoryPath,
  rsvpOverridePath,
  rsvpParticipantsPath,
  rsvpSummaryPath,
} from '../constants/practice-rsvp-detail-api.constants';
import {
  mapHistory,
  mapParticipantsPage,
  mapRecord,
  mapSummary,
} from '../mappers/practice-rsvp-detail.mapper';
import {
  listRsvpsResponseSchema,
  rsvpHistoryResponseSchema,
  rsvpResponseSchema,
  rsvpSummaryResponseSchema,
} from '../schemas/practice-rsvp-detail.schema';
import type {
  RsvpDetailRequestParams,
  RsvpHistory,
  RsvpOverrideCommand,
  RsvpParticipantsPage,
  RsvpParticipantsQuery,
  RsvpRecord,
  RsvpSummary,
} from '../types/practice-rsvp-detail.types';

/** One page of the session roster, optionally narrowed to a single RSVP status. */
export async function requestRsvpParticipants(
  query: RsvpParticipantsQuery,
): Promise<RsvpParticipantsPage> {
  const dto = await getAppHttpClient().get(
    rsvpParticipantsPath(query.teamId, query.sessionId),
    listRsvpsResponseSchema,
    {
      params: {
        limit: query.limit,
        offset: query.offset,
        ...(query.status === null ? {} : { status: query.status }),
      },
    },
  );
  return mapParticipantsPage(dto);
}

/** Privacy-safe planning counts; no membership identifiers travel with it. */
export async function requestRsvpSummary(params: RsvpDetailRequestParams): Promise<RsvpSummary> {
  const dto = await getAppHttpClient().get(
    rsvpSummaryPath(params.teamId, params.sessionId),
    rsvpSummaryResponseSchema,
  );
  return mapSummary(dto);
}

/**
 * Override one member's RSVP on their behalf. Optional fields are omitted
 * from the body rather than sent as `null` — the DTO defines them as
 * optional strings/enums, not nullable ones, so a coach who leaves the note
 * blank must not send a field the server was never told how to accept.
 */
export async function requestOverrideRsvp(command: RsvpOverrideCommand): Promise<RsvpRecord> {
  const dto = await getAppHttpClient().put(
    rsvpOverridePath(command.teamId, command.sessionId, command.membershipId),
    {
      status: command.status,
      reason: command.reason,
      ...(command.reasonCategory === null ? {} : { reasonCategory: command.reasonCategory }),
      ...(command.note === null ? {} : { note: command.note }),
      ...(command.noteVisibility === null ? {} : { noteVisibility: command.noteVisibility }),
      ...(command.expectedVersion === null ? {} : { expectedVersion: command.expectedVersion }),
    },
    rsvpResponseSchema,
  );
  return mapRecord(dto);
}

/** One member's full revision trail — the reason the override endpoint is trustworthy. */
export async function requestRsvpHistory(
  params: RsvpDetailRequestParams & { readonly membershipId: string },
): Promise<RsvpHistory> {
  const dto = await getAppHttpClient().get(
    rsvpHistoryPath(params.teamId, params.sessionId, params.membershipId),
    rsvpHistoryResponseSchema,
  );
  return mapHistory(dto);
}
