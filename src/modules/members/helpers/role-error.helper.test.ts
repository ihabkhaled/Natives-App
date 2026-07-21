import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import { resolveRoleErrorKey } from './role-error.helper';

function appErrorWith(messageKey: string | undefined): AppError {
  return new AppError({ code: APP_ERROR_CODE.Conflict, messageKey });
}

describe('resolveRoleErrorKey', () => {
  it('surfaces the account-required reason for an accountless membership', () => {
    expect(resolveRoleErrorKey(appErrorWith('errors.members.accountRequired'))).toBe(
      I18N_KEYS.members.roleErrorAccountRequired,
    );
  });

  it('surfaces the privilege-ceiling reason for an escalation denial', () => {
    expect(resolveRoleErrorKey(appErrorWith('errors.rbac.escalationDenied'))).toBe(
      I18N_KEYS.members.roleErrorForbidden,
    );
  });

  it('surfaces the privilege-ceiling reason for a permission denial', () => {
    expect(resolveRoleErrorKey(appErrorWith('errors.auth.permissionDenied'))).toBe(
      I18N_KEYS.members.roleErrorForbidden,
    );
  });

  it('surfaces the role-not-found reason for an unknown role slug', () => {
    expect(resolveRoleErrorKey(appErrorWith('errors.rbac.roleNotFound'))).toBe(
      I18N_KEYS.members.roleErrorRoleNotFound,
    );
  });

  it('falls back to the generic retry message for an unmapped key', () => {
    expect(resolveRoleErrorKey(appErrorWith('errors.something.else'))).toBe(
      I18N_KEYS.members.roleErrorToast,
    );
  });

  it('falls back to the generic retry message when the key is absent', () => {
    expect(resolveRoleErrorKey(appErrorWith(undefined))).toBe(I18N_KEYS.members.roleErrorToast);
  });

  it('falls back to the generic retry message for a non-AppError value', () => {
    expect(resolveRoleErrorKey(new Error('boom'))).toBe(I18N_KEYS.members.roleErrorToast);
  });
});
