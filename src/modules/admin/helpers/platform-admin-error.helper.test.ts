import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import { resolvePlatformAdminErrorKey } from './platform-admin-error.helper';

describe('resolvePlatformAdminErrorKey', () => {
  it('states the last-admin safeguard in privilege terms from its 409 key', () => {
    expect(
      resolvePlatformAdminErrorKey(
        new AppError({ code: APP_ERROR_CODE.Conflict, messageKey: 'errors.rbac.lastSuperAdmin' }),
      ),
    ).toBe(I18N_KEYS.adminPlatform.lastAdminError);
  });

  it('maps a missing assignment through both the key and the 404 class', () => {
    expect(
      resolvePlatformAdminErrorKey(
        new AppError({
          code: APP_ERROR_CODE.NotFound,
          messageKey: 'errors.rbac.assignmentNotFound',
        }),
      ),
    ).toBe(I18N_KEYS.adminPlatform.notFoundError);
    expect(resolvePlatformAdminErrorKey(new AppError({ code: APP_ERROR_CODE.NotFound }))).toBe(
      I18N_KEYS.adminPlatform.notFoundError,
    );
  });

  it('maps the remaining classes to their dedicated copy', () => {
    expect(resolvePlatformAdminErrorKey(new AppError({ code: APP_ERROR_CODE.Forbidden }))).toBe(
      I18N_KEYS.adminPlatform.forbiddenError,
    );
    expect(resolvePlatformAdminErrorKey(new AppError({ code: APP_ERROR_CODE.Conflict }))).toBe(
      I18N_KEYS.adminPlatform.targetConflictError,
    );
    expect(resolvePlatformAdminErrorKey(new AppError({ code: APP_ERROR_CODE.Validation }))).toBe(
      I18N_KEYS.adminPlatform.validationError,
    );
  });

  it('falls back to the generic line for unknown errors and non-AppErrors', () => {
    expect(resolvePlatformAdminErrorKey(new AppError({ code: APP_ERROR_CODE.Server }))).toBe(
      I18N_KEYS.adminPlatform.genericError,
    );
    expect(resolvePlatformAdminErrorKey(new Error('boom'))).toBe(
      I18N_KEYS.adminPlatform.genericError,
    );
  });
});
