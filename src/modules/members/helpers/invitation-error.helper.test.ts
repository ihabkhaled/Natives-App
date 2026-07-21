import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import { resolveInvitationErrorKey } from './invitation-error.helper';

function appError(code: string, messageKey?: string): AppError {
  return new AppError({ code: code as never, messageKey });
}

describe('resolveInvitationErrorKey', () => {
  it('names a duplicate invitation or an already-registered email', () => {
    expect(
      resolveInvitationErrorKey(
        appError(APP_ERROR_CODE.Conflict, 'errors.identity.invitationAlreadyExists'),
      ),
    ).toBe(I18N_KEYS.members.inviteDuplicateError);
    expect(
      resolveInvitationErrorKey(
        appError(APP_ERROR_CODE.Conflict, 'errors.identity.emailAlreadyRegistered'),
      ),
    ).toBe(I18N_KEYS.members.inviteDuplicateError);
  });

  it('names an expired invitation', () => {
    expect(
      resolveInvitationErrorKey(
        appError(APP_ERROR_CODE.Conflict, 'errors.identity.invitationExpired'),
      ),
    ).toBe(I18N_KEYS.members.inviteExpiredError);
  });

  it('names a malformed invitation', () => {
    expect(
      resolveInvitationErrorKey(
        appError(APP_ERROR_CODE.Validation, 'errors.identity.invitationInvalid'),
      ),
    ).toBe(I18N_KEYS.members.inviteInvalidError);
  });

  it('falls back to the error class when the message key is unmapped', () => {
    expect(resolveInvitationErrorKey(appError(APP_ERROR_CODE.Conflict, 'errors.other'))).toBe(
      I18N_KEYS.members.inviteDuplicateError,
    );
    expect(resolveInvitationErrorKey(appError(APP_ERROR_CODE.Validation))).toBe(
      I18N_KEYS.members.inviteInvalidError,
    );
  });

  it('falls back to the generic failure for anything else', () => {
    expect(resolveInvitationErrorKey(appError(APP_ERROR_CODE.Server))).toBe(
      I18N_KEYS.members.inviteFailedError,
    );
    expect(resolveInvitationErrorKey(new Error('boom'))).toBe(I18N_KEYS.members.inviteFailedError);
  });
});
