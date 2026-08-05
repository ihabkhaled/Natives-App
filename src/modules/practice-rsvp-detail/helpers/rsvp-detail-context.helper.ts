import type { RsvpParticipantsPage } from '../types/practice-rsvp-detail.types';

/** Team scope and permissions resolve independently; both must settle first. */
export function resolveContextLoading(isScopeLoading: boolean, isPermissionsLoading: boolean): boolean {
  return isScopeLoading || isPermissionsLoading;
}

/** The screen may read once context has settled, the grant is held, and a session id resolved. */
export function resolveCanReadRsvpDetail(
  contextLoading: boolean,
  canManage: boolean,
  sessionId: string,
): boolean {
  return !contextLoading && canManage && sessionId !== '';
}

/**
 * Forbidden only once permissions have actually settled — never during the
 * window where they are still resolving, which would flash "forbidden" at a
 * coach who holds the grant.
 */
export function resolveIsForbidden(isPermissionsLoading: boolean, canManage: boolean): boolean {
  return !isPermissionsLoading && !canManage;
}

export function resolveIsRsvpDetailLoading(
  contextLoading: boolean,
  isParticipantsPending: boolean,
  isSummaryPending: boolean,
): boolean {
  return contextLoading || isParticipantsPending || isSummaryPending;
}

export function resolveRsvpDetailHasError(isParticipantsError: boolean, isSummaryError: boolean): boolean {
  return isParticipantsError || isSummaryError;
}

/**
 * "Load more" stops offering itself once every match is already on screen,
 * or once the window has already grown to the contract's own `limit` ceiling.
 */
export function resolveHasMoreParticipants(
  page: RsvpParticipantsPage | undefined,
  pageSize: number,
  maxPageSize: number,
): boolean {
  if (page === undefined) {
    return false;
  }
  return page.items.length < page.total && pageSize < maxPageSize;
}
