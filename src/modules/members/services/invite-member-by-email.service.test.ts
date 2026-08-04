import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/packages/http';
import { getApplicationOrigin } from '@/platform';
import { APP_ERROR_CODE, isAppError } from '@/shared/errors';

import { requestCreateInvitation, requestInviteMember } from '../gateways/members.gateway';
import { invitePersonByEmail } from './invite-member-by-email.service';

vi.mock('@/platform', () => ({ getApplicationOrigin: vi.fn() }));
vi.mock('../gateways/members.gateway', () => ({
  requestCreateInvitation: vi.fn(),
  requestInviteMember: vi.fn(),
}));

const INVITATION = {
  id: 'inv-1',
  email: 'omar@example.com',
  role: 'user',
  status: 'pending' as const,
  teamId: 'team-1',
  teamRole: 'coach',
  expiresAt: '2026-07-28T00:00:00.000Z',
  createdAt: '2026-07-21T00:00:00.000Z',
  token: 'one-time-token',
};

const INPUT = {
  email: 'omar@example.com',
  teamRole: 'coach',
  profile: { fullName: 'Omar', nickname: null, jerseyNumber: null },
};

beforeEach(() => {
  vi.mocked(getApplicationOrigin).mockReturnValue('https://app.example.com');
  vi.mocked(requestCreateInvitation).mockResolvedValue(INVITATION);
  // The membership record is created but never read back by this use case.
  vi.mocked(requestInviteMember).mockResolvedValue({} as never);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('invitePersonByEmail', () => {
  it('creates the account invitation AND the roster record', async () => {
    await invitePersonByEmail('team-1', INPUT);

    expect(requestCreateInvitation).toHaveBeenCalledWith('team-1', {
      email: 'omar@example.com',
      teamRole: 'coach',
    });
    expect(requestInviteMember).toHaveBeenCalledWith('team-1', {
      ...INPUT.profile,
      email: 'omar@example.com',
    });
  });

  /**
   * The P0 regression guard. Acceptance claims an invited membership by
   * matching the roster profile's email against the invitation; a membership
   * written without that address is one nobody can claim, so the invitee lands
   * with an active account, no membership, no team context, no role grant and
   * a navigation menu collapsed to the permission-free destinations.
   */
  it('gives the membership profile the SAME email as the invitation', async () => {
    await invitePersonByEmail('team-1', INPUT);

    const invitationEmail = vi.mocked(requestCreateInvitation).mock.calls[0]?.[1].email;
    const profileEmail = vi.mocked(requestInviteMember).mock.calls[0]?.[1].email;
    expect(profileEmail).toBe(invitationEmail);
    expect(profileEmail).not.toBeNull();
  });

  it('normalizes once, so casing and padding cannot split the two records', async () => {
    await invitePersonByEmail('team-1', { ...INPUT, email: '  Omar@Example.COM  ' });

    expect(vi.mocked(requestCreateInvitation).mock.calls[0]?.[1].email).toBe('omar@example.com');
    expect(vi.mocked(requestInviteMember).mock.calls[0]?.[1].email).toBe('omar@example.com');
  });

  it('creates the invitation FIRST, so a refusal leaves no orphan directory row', async () => {
    vi.mocked(requestCreateInvitation).mockRejectedValue(
      new HttpError({ kind: 'conflict', status: 409, message: 'Duplicate' }),
    );

    await expect(invitePersonByEmail('team-1', INPUT)).rejects.toBeDefined();
    expect(requestInviteMember).not.toHaveBeenCalled();
  });

  it('returns the one-time accept link built from this build own origin', async () => {
    await expect(invitePersonByEmail('team-1', INPUT)).resolves.toEqual({
      id: 'inv-1',
      email: 'omar@example.com',
      teamRole: 'coach',
      status: 'pending',
      expiresAt: '2026-07-28T00:00:00.000Z',
      acceptUrl: 'https://app.example.com/accept-invitation?token=one-time-token',
    });
  });

  it('normalizes a refusal into a sanitized AppError carrying its class', async () => {
    vi.mocked(requestCreateInvitation).mockRejectedValue(
      new HttpError({ kind: 'conflict', status: 409, message: 'Duplicate' }),
    );

    const error: unknown = await invitePersonByEmail('team-1', INPUT).catch(
      (caught: unknown) => caught,
    );
    expect(isAppError(error)).toBe(true);
    expect((error as { code: string }).code).toBe(APP_ERROR_CODE.Conflict);
  });
});
