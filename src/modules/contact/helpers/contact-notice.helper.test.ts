import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError, type AppErrorCode } from '@/shared/errors';

import { CONTACT_NOTICE_TONE } from '../contact.constants';
import { buildContactNotice, type ContactNoticeParams } from './contact-notice.helper';

const onRetry = vi.fn();

/** Keys in, keys out: the assertions name the copy without owning the wording. */
function translate(key: string): string {
  return key;
}

function params(overrides: Partial<ContactNoticeParams> = {}): ContactNoticeParams {
  return {
    translate,
    isFormEnabled: true,
    isSent: false,
    error: null,
    onRetry,
    ...overrides,
  };
}

function failure(code: AppErrorCode): AppError {
  return new AppError({ code });
}

describe('buildContactNotice', () => {
  it('is silent while the form is idle', () => {
    expect(buildContactNotice(params())).toBeNull();
  });

  it('says the relay is switched off before anything else', () => {
    const notice = buildContactNotice(
      params({ isFormEnabled: false, isSent: true, error: failure(APP_ERROR_CODE.Server) }),
    );

    expect(notice).toEqual({
      tone: CONTACT_NOTICE_TONE.Warning,
      title: 'contact.unavailableTitle',
      message: 'contact.unavailableMessage',
      retry: null,
    });
  });

  it('confirms a sent message', () => {
    const notice = buildContactNotice(params({ isSent: true }));

    expect(notice).toEqual({
      tone: CONTACT_NOTICE_TONE.Success,
      title: 'contact.sentTitle',
      message: 'contact.sentMessage',
      retry: null,
    });
  });

  it('never hides a failure behind a stale success', () => {
    const notice = buildContactNotice(
      params({ isSent: true, error: failure(APP_ERROR_CODE.RateLimited) }),
    );

    expect(notice?.tone).toBe(CONTACT_NOTICE_TONE.Error);
    expect(notice?.title).toBe('contact.errorRateLimitedTitle');
  });

  it('points a rejected body at the fields, with no retry to offer', () => {
    const notice = buildContactNotice(params({ error: failure(APP_ERROR_CODE.Validation) }));

    expect(notice).toEqual({
      tone: CONTACT_NOTICE_TONE.Error,
      title: 'contact.errorValidationTitle',
      message: 'contact.errorValidationMessage',
      retry: null,
    });
  });

  it('tells a rate-limited visitor to wait rather than to retry now', () => {
    const notice = buildContactNotice(params({ error: failure(APP_ERROR_CODE.RateLimited) }));

    expect(notice?.message).toBe('contact.errorRateLimitedMessage');
    expect(notice?.retry).toBeNull();
  });

  it('offers a retry when the email channel could not take the message', () => {
    const notice = buildContactNotice(params({ error: failure(APP_ERROR_CODE.Server) }));

    expect(notice?.title).toBe('contact.errorChannelTitle');
    expect(notice?.retry?.label).toBe('contact.retry');
  });

  it.each([APP_ERROR_CODE.NetworkOffline, APP_ERROR_CODE.Timeout])(
    'offers a retry for a transport failure (%s)',
    (code) => {
      const notice = buildContactNotice(params({ error: failure(code) }));

      expect(notice?.title).toBe('contact.errorNetworkTitle');
      expect(notice?.message).toBe('contact.errorNetworkMessage');
      expect(notice?.retry).not.toBeNull();
    },
  );

  it('falls back to honest "not sent" copy for an unmapped code', () => {
    const notice = buildContactNotice(params({ error: failure(APP_ERROR_CODE.Forbidden) }));

    expect(notice?.title).toBe('contact.errorUnexpectedTitle');
    expect(notice?.message).toBe('contact.errorUnexpectedMessage');
  });

  it('wires the retry affordance to the caller handler', () => {
    const notice = buildContactNotice(params({ error: failure(APP_ERROR_CODE.NetworkOffline) }));
    notice?.retry?.onRetry();

    expect(onRetry).toHaveBeenCalled();
  });
});
