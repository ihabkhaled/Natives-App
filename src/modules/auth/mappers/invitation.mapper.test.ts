import { describe, expect, it } from 'vitest';

import { mapInvitationDtoToDetails } from './invitation.mapper';

describe('mapInvitationDtoToDetails', () => {
  it('normalizes the exact backend projection and preserves a missing inviter', () => {
    expect(
      mapInvitationDtoToDetails({
        email: 'Invitee@Example.com',
        role: 'user',
        inviterName: null,
        teamRole: 'coach',
        teamId: 'team-natives',
        teamName: 'Cairo Natives',
        expiresAt: '2026-08-01T12:00:00.000Z',
      }),
    ).toEqual({
      email: 'invitee@example.com',
      role: 'user',
      inviterName: null,
      teamRole: 'coach',
      teamName: 'Cairo Natives',
      expiresAtIso: '2026-08-01T12:00:00.000Z',
    });
  });

  it('trims a present inviter name and team name', () => {
    const invitation = mapInvitationDtoToDetails({
      email: 'invitee@example.com',
      role: 'admin',
      inviterName: '  Coach Nadia  ',
      teamRole: 'member',
      teamId: 'team-natives',
      teamName: '  Cairo Natives  ',
      expiresAt: '2026-08-01T12:00:00.000Z',
    });

    expect(invitation.inviterName).toBe('Coach Nadia');
    expect(invitation.teamName).toBe('Cairo Natives');
  });

  it('keeps a platform-scoped invitation team-less rather than inventing one', () => {
    const invitation = mapInvitationDtoToDetails({
      email: 'invitee@example.com',
      role: 'user',
      inviterName: null,
      teamRole: 'member',
      teamId: null,
      teamName: null,
      expiresAt: '2026-08-01T12:00:00.000Z',
    });

    expect(invitation.teamName).toBeNull();
  });
});
