import { describe, expect, it } from 'vitest';

import {
  resolveCanReadRsvpDetail,
  resolveContextLoading,
  resolveHasMoreParticipants,
  resolveIsForbidden,
  resolveIsRsvpDetailLoading,
  resolveRsvpDetailHasError,
} from './rsvp-detail-context.helper';

describe('resolveContextLoading', () => {
  it('is loading while either the scope or the permissions read is loading', () => {
    expect(resolveContextLoading(true, false)).toBe(true);
    expect(resolveContextLoading(false, true)).toBe(true);
  });

  it('settles once both have resolved', () => {
    expect(resolveContextLoading(false, false)).toBe(false);
  });
});

describe('resolveCanReadRsvpDetail', () => {
  it('reads only once context has settled, the grant is held, and a session id resolved', () => {
    expect(resolveCanReadRsvpDetail(false, true, 's1')).toBe(true);
  });

  it('refuses while context is still loading', () => {
    expect(resolveCanReadRsvpDetail(true, true, 's1')).toBe(false);
  });

  it('refuses without the manage grant', () => {
    expect(resolveCanReadRsvpDetail(false, false, 's1')).toBe(false);
  });

  it('refuses an unresolved session id', () => {
    expect(resolveCanReadRsvpDetail(false, true, '')).toBe(false);
  });
});

describe('resolveIsForbidden', () => {
  it('is never forbidden while permissions are still resolving', () => {
    expect(resolveIsForbidden(true, false)).toBe(false);
  });

  it('is forbidden once permissions have settled without the grant', () => {
    expect(resolveIsForbidden(false, false)).toBe(true);
  });

  it('is not forbidden once the grant is held', () => {
    expect(resolveIsForbidden(false, true)).toBe(false);
  });
});

describe('resolveIsRsvpDetailLoading', () => {
  it('is loading while context or either read is still pending', () => {
    expect(resolveIsRsvpDetailLoading(true, false, false)).toBe(true);
    expect(resolveIsRsvpDetailLoading(false, true, false)).toBe(true);
    expect(resolveIsRsvpDetailLoading(false, false, true)).toBe(true);
  });

  it('settles once context and both reads have resolved', () => {
    expect(resolveIsRsvpDetailLoading(false, false, false)).toBe(false);
  });
});

describe('resolveRsvpDetailHasError', () => {
  it('reports an error from either the roster or the summary read', () => {
    expect(resolveRsvpDetailHasError(true, false)).toBe(true);
    expect(resolveRsvpDetailHasError(false, true)).toBe(true);
  });

  it('reports no error once both reads succeeded', () => {
    expect(resolveRsvpDetailHasError(false, false)).toBe(false);
  });
});

describe('resolveHasMoreParticipants', () => {
  it('has nothing more before the first page has loaded', () => {
    expect(resolveHasMoreParticipants(undefined, 20, 100)).toBe(false);
  });

  it('offers more while the page holds fewer items than the total', () => {
    const page = { items: [{ membershipId: 'm1' }], total: 5, limit: 20, offset: 0 } as never;
    expect(resolveHasMoreParticipants(page, 20, 100)).toBe(true);
  });

  it('stops once every match is already on screen', () => {
    const page = { items: [{ membershipId: 'm1' }], total: 1, limit: 20, offset: 0 } as never;
    expect(resolveHasMoreParticipants(page, 20, 100)).toBe(false);
  });

  it('stops once the window has grown to the contract\'s own ceiling', () => {
    const page = { items: [{ membershipId: 'm1' }], total: 500, limit: 100, offset: 0 } as never;
    expect(resolveHasMoreParticipants(page, 100, 100)).toBe(false);
  });
});
