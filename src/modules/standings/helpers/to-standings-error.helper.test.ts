import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { AppError } from '@/shared/errors/app.errors';
import { APP_ERROR_CODE } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import {
  isStandingsVersionConflict,
  resolveStandingsWriteErrorKey,
  runStandingsRequest,
} from './to-standings-error.helper';

function appError(messageKey: string): AppError {
  return new AppError({ code: APP_ERROR_CODE.Conflict, message: 'conflict', messageKey });
}

describe('runStandingsRequest', () => {
  it('passes a successful result through', async () => {
    await expect(runStandingsRequest(() => Promise.resolve(42))).resolves.toBe(42);
  });

  it('normalizes an HTTP error into an AppError carrying its message key', async () => {
    const failing = (): Promise<never> =>
      Promise.reject(
        new HttpError({
          kind: HTTP_ERROR_KIND.Conflict,
          status: 409,
          messageKey: 'errors.standings.versionConflict',
        }),
      );
    await expect(runStandingsRequest(failing)).rejects.toBeInstanceOf(AppError);
  });

  it('normalizes a non-HTTP failure into an AppError', async () => {
    await expect(
      runStandingsRequest(() => Promise.reject(new Error('boom'))),
    ).rejects.toBeInstanceOf(AppError);
  });
});

describe('isStandingsVersionConflict', () => {
  it('detects the optimistic-concurrency conflict', () => {
    expect(isStandingsVersionConflict(appError('errors.standings.versionConflict'))).toBe(true);
  });

  it('ignores other errors', () => {
    expect(isStandingsVersionConflict(appError('errors.standings.validation'))).toBe(false);
    expect(isStandingsVersionConflict(new Error('plain'))).toBe(false);
  });
});

describe('resolveStandingsWriteErrorKey', () => {
  it('maps known message keys to specific copy', () => {
    expect(
      resolveStandingsWriteErrorKey(
        appError('errors.standings.versionConflict'),
        I18N_KEYS.standings.manualFailed,
      ),
    ).toBe(I18N_KEYS.standings.transitionConflict);
    expect(
      resolveStandingsWriteErrorKey(
        appError('errors.standings.provenanceRequired'),
        I18N_KEYS.standings.manualFailed,
      ),
    ).toBe(I18N_KEYS.standings.manualNoteTooShort);
  });

  it('falls back for an unknown or non-app error', () => {
    expect(resolveStandingsWriteErrorKey(new Error('x'), I18N_KEYS.standings.createFailed)).toBe(
      I18N_KEYS.standings.createFailed,
    );
    expect(
      resolveStandingsWriteErrorKey(appError('errors.other'), I18N_KEYS.standings.createFailed),
    ).toBe(I18N_KEYS.standings.createFailed);
  });
});
