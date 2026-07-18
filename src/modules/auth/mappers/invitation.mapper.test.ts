import { describe, expect, it } from 'vitest';

import { mapInvitationDtoToDetails } from './invitation.mapper';

describe('mapInvitationDtoToDetails', () => {
  it('normalizes the exact backend projection and preserves a missing inviter', () => {
    expect(
      mapInvitationDtoToDetails({
        email: 'Invitee@Example.com',
        role: 'user',
        inviterName: null,
        expiresAt: '2026-08-01T12:00:00.000Z',
      }),
    ).toEqual({
      email: 'invitee@example.com',
      role: 'user',
      inviterName: null,
      expiresAtIso: '2026-08-01T12:00:00.000Z',
    });
  });

  it('trims a present inviter name', () => {
    const invitation = mapInvitationDtoToDetails({
      email: 'invitee@example.com',
      role: 'admin',
      inviterName: '  Coach Nadia  ',
      expiresAt: '2026-08-01T12:00:00.000Z',
    });

    expect(invitation.inviterName).toBe('Coach Nadia');
  });
});
