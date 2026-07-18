import { describe, expect, it } from 'vitest';

import { mapInvitationDtoToDetails } from './invitation.mapper';

describe('mapInvitationDtoToDetails', () => {
  it('normalizes the email and trims names', () => {
    expect(
      mapInvitationDtoToDetails({
        email: 'Invitee@Example.com',
        teamName: '  Cairo Natives  ',
        inviterName: '  Coach Nadia  ',
        expiresAt: '2026-08-01T12:00:00.000Z',
      }),
    ).toEqual({
      email: 'invitee@example.com',
      teamName: 'Cairo Natives',
      inviterName: 'Coach Nadia',
      expiresAtIso: '2026-08-01T12:00:00.000Z',
    });
  });
});
