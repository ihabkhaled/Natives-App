import { afterEach, describe, expect, it, vi } from 'vitest';

import { getInvitation } from '../services/get-invitation.service';
import { authQueryKeys } from './auth.keys';
import { buildInvitationQueryOptions } from './invitation.query';

vi.mock('../services/get-invitation.service', () => ({ getInvitation: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('buildInvitationQueryOptions', () => {
  it('keys the query by the invitation token', () => {
    expect(buildInvitationQueryOptions('abc').queryKey).toEqual(authQueryKeys.invitation('abc'));
  });

  it('enables the query only when a token is present', () => {
    expect(buildInvitationQueryOptions('abc').enabled).toBe(true);
    expect(buildInvitationQueryOptions('').enabled).toBe(false);
  });

  it('delegates lookup to the invitation use case with the token', async () => {
    const details = {
      email: 'invitee@example.com',
      teamName: 'Cairo Natives',
      inviterName: 'Coach Nadia',
      expiresAtIso: '2026-08-01T12:00:00.000Z',
    };
    vi.mocked(getInvitation).mockResolvedValue(details);

    await expect(buildInvitationQueryOptions('abc').queryFn()).resolves.toBe(details);
    expect(getInvitation).toHaveBeenCalledExactlyOnceWith('abc');
  });
});
