import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildInviteFormCopy } from './invite-form-copy.helper';
import { isInviteFormValid, validateInviteForm } from './invite-form.helper';
import { buildInviteSentView } from './invite-sent-view.helper';

const t = (key: string): string => key;

describe('validateInviteForm', () => {
  it('requires both records inputs: the email and the roster name', () => {
    const errors = validateInviteForm('', '');
    expect(errors.email).toBe(I18N_KEYS.members.inviteEmailRequired);
    expect(errors.fullName).toBe(I18N_KEYS.members.inviteFullNameRequired);
    expect(isInviteFormValid(errors)).toBe(false);
  });

  it('refuses a malformed address at the edge rather than letting the server do it', () => {
    expect(validateInviteForm('not-an-email', 'Name').email).toBe(
      I18N_KEYS.members.inviteEmailInvalid,
    );
  });

  it('accepts a complete form and trims around the address', () => {
    expect(isInviteFormValid(validateInviteForm('  omar@example.com ', 'Omar'))).toBe(true);
  });

  it('flags a whitespace-only name', () => {
    expect(validateInviteForm('omar@example.com', '   ').fullName).toBe(
      I18N_KEYS.members.inviteFullNameRequired,
    );
  });
});

describe('buildInviteFormCopy', () => {
  it('resolves every fixed label once and ships NO role options of its own', () => {
    const copy = buildInviteFormCopy(t);

    expect(copy.emailLabel).toBe(I18N_KEYS.members.inviteEmailLabel);
    expect(copy.profileHeading).toBe(I18N_KEYS.members.inviteProfileHeading);
    expect(copy.roleLabel).toBe(I18N_KEYS.members.inviteRoleLabel);
    // The options are server-driven; static copy must not contain a role list.
    expect(Object.keys(copy)).not.toContain('roleOptions');
  });
});

describe('buildInviteSentView', () => {
  it('states the address, the team, and the granted role back with the link', () => {
    const onCopy = (): void => undefined;
    const onDone = (): void => undefined;
    const view = buildInviteSentView(
      t,
      {
        id: 'inv-1',
        email: 'omar@example.com',
        teamRole: 'coach',
        status: 'pending',
        expiresAt: '2026-07-28T00:00:00.000Z',
        acceptUrl: 'https://app.example.com/accept-invitation?token=abc',
      },
      'Cairo Natives',
      { onCopy, onDone, formatExpiry: (iso) => `formatted:${iso}` },
    );

    expect(view.acceptUrl).toBe('https://app.example.com/accept-invitation?token=abc');
    expect(view.expiresValue).toBe('formatted:2026-07-28T00:00:00.000Z');
    expect(view.roleLabel).toBe(I18N_KEYS.members.inviteSentRoleLabel);
    expect(view.roleValue).toBe(I18N_KEYS.members.roleCoach);
    expect(view.teamLabel).toBe(I18N_KEYS.members.inviteSentTeamLabel);
    expect(view.teamValue).toBe('Cairo Natives');
    expect(view.onCopy).toBe(onCopy);
    expect(view.onDone).toBe(onDone);
    expect(view.title).toBe(I18N_KEYS.members.inviteSentTitle);
  });

  it('labels an unseen granted slug through the humanized fallback', () => {
    const view = buildInviteSentView(
      t,
      {
        id: 'inv-2',
        email: 'omar@example.com',
        teamRole: 'physio_lead',
        status: 'pending',
        expiresAt: '2026-07-28T00:00:00.000Z',
        acceptUrl: 'https://app.example.com/accept-invitation?token=abc',
      },
      'Cairo Natives',
      {
        onCopy: () => undefined,
        onDone: () => undefined,
        formatExpiry: (iso) => iso,
      },
    );

    expect(view.roleValue).toBe('Physio Lead');
  });
});
