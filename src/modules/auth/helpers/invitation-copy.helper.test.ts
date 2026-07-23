import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import type { InvitationDetails } from '../types/auth.types';
import { buildInvitationIntro } from './invitation-copy.helper';

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join('|')}`;

function invitation(overrides: Partial<InvitationDetails> = {}): InvitationDetails {
  return {
    email: 'invitee@example.com',
    role: 'user',
    inviterName: 'Coach Nadia',
    teamRole: 'coach',
    teamName: 'Cairo Natives',
    expiresAtIso: '2026-08-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('buildInvitationIntro', () => {
  it('names the inviter, the team, and the translated role', () => {
    expect(buildInvitationIntro(invitation(), t)).toBe(
      `${I18N_KEYS.auth.acceptInvitationIntroTeamRoleWithInviter}:Coach Nadia|Cairo Natives|${I18N_KEYS.members.roleCoach}`,
    );
  });

  it('drops the inviter line when no display name exists', () => {
    expect(buildInvitationIntro(invitation({ inviterName: null }), t)).toBe(
      `${I18N_KEYS.auth.acceptInvitationIntroTeamRole}:Cairo Natives|${I18N_KEYS.members.roleCoach}`,
    );
  });

  it('keeps the branded team-less line for a platform-scoped invitation', () => {
    expect(buildInvitationIntro(invitation({ teamName: null, inviterName: null }), t)).toBe(
      `${I18N_KEYS.auth.acceptInvitationIntroFromTeam}:${I18N_KEYS.members.roleCoach}`,
    );
    expect(buildInvitationIntro(invitation({ teamName: null }), t)).toBe(
      `${I18N_KEYS.auth.acceptInvitationIntroWithInviter}:Coach Nadia|${I18N_KEYS.members.roleCoach}`,
    );
  });

  it('humanizes an unseen role slug instead of importing a catalog', () => {
    expect(buildInvitationIntro(invitation({ teamRole: 'physio_lead' }), t)).toBe(
      `${I18N_KEYS.auth.acceptInvitationIntroTeamRoleWithInviter}:Coach Nadia|Cairo Natives|Physio Lead`,
    );
  });
});
