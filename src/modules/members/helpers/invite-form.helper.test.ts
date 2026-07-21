import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildInviteFormCopy } from './invite-form-copy.helper';
import {
  buildInvitationRoleOptions,
  isInviteFormValid,
  toInvitationRole,
  validateInviteForm,
} from './invite-form.helper';
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

describe('toInvitationRole', () => {
  it('passes a role the endpoint accepts straight through', () => {
    expect(toInvitationRole('admin')).toBe('admin');
    expect(toInvitationRole('user')).toBe('user');
  });

  it('degrades an unknown value to the least-privileged role', () => {
    expect(toInvitationRole('superuser')).toBe('user');
  });
});

describe('buildInvitationRoleOptions', () => {
  it('offers exactly the two access levels the identity layer defines', () => {
    expect(buildInvitationRoleOptions(t)).toEqual([
      { value: 'user', label: I18N_KEYS.members.inviteRoleUser },
      { value: 'admin', label: I18N_KEYS.members.inviteRoleAdmin },
    ]);
  });
});

describe('buildInviteFormCopy', () => {
  it('resolves every fixed label once', () => {
    const copy = buildInviteFormCopy(t);

    expect(copy.emailLabel).toBe(I18N_KEYS.members.inviteEmailLabel);
    expect(copy.profileHeading).toBe(I18N_KEYS.members.inviteProfileHeading);
    expect(copy.roleOptions).toHaveLength(2);
  });
});

describe('buildInviteSentView', () => {
  it('names the address it went to and carries the one-time link', () => {
    const onCopy = (): void => undefined;
    const onDone = (): void => undefined;
    const view = buildInviteSentView(
      t,
      {
        id: 'inv-1',
        email: 'omar@example.com',
        role: 'user',
        status: 'pending',
        expiresAt: '2026-07-28T00:00:00.000Z',
        acceptUrl: 'https://app.example.com/accept-invitation?token=abc',
      },
      { onCopy, onDone, formatExpiry: (iso) => `formatted:${iso}` },
    );

    expect(view.acceptUrl).toBe('https://app.example.com/accept-invitation?token=abc');
    expect(view.expiresValue).toBe('formatted:2026-07-28T00:00:00.000Z');
    expect(view.onCopy).toBe(onCopy);
    expect(view.onDone).toBe(onDone);
    expect(view.title).toBe(I18N_KEYS.members.inviteSentTitle);
  });
});
