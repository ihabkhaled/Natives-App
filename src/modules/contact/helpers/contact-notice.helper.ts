import { APP_ERROR_CODE, type AppError, type AppErrorCode } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import { CONTACT_NOTICE_TONE } from '../contact.constants';
import type { ContactNoticeView } from '../types/contact.types';

type Translate = (key: string) => string;

interface ContactFailureCopy {
  readonly titleKey: string;
  readonly messageKey: string;
  /** Whether re-sending the same message could plausibly succeed now. */
  readonly isRetryable: boolean;
}

const keys = I18N_KEYS.contact;

/**
 * Failure copy per error code, mapped from what `POST /contact` documents:
 * 400 → the body was rejected (fields are marked individually too), 429 →
 * rate limited, 503/500 → the operator email channel could not take the
 * message. Anything not listed falls back to the "not sent" copy below,
 * which never claims to know more than it does.
 */
const FAILURE_COPY: Partial<Readonly<Record<AppErrorCode, ContactFailureCopy>>> = {
  [APP_ERROR_CODE.Validation]: {
    titleKey: keys.errorValidationTitle,
    messageKey: keys.errorValidationMessage,
    isRetryable: false,
  },
  [APP_ERROR_CODE.RateLimited]: {
    titleKey: keys.errorRateLimitedTitle,
    messageKey: keys.errorRateLimitedMessage,
    isRetryable: false,
  },
  [APP_ERROR_CODE.Server]: {
    titleKey: keys.errorChannelTitle,
    messageKey: keys.errorChannelMessage,
    isRetryable: true,
  },
  [APP_ERROR_CODE.NetworkOffline]: {
    titleKey: keys.errorNetworkTitle,
    messageKey: keys.errorNetworkMessage,
    isRetryable: true,
  },
  [APP_ERROR_CODE.Timeout]: {
    titleKey: keys.errorNetworkTitle,
    messageKey: keys.errorNetworkMessage,
    isRetryable: true,
  },
};

const UNEXPECTED_COPY: ContactFailureCopy = {
  titleKey: keys.errorUnexpectedTitle,
  messageKey: keys.errorUnexpectedMessage,
  isRetryable: true,
};

export interface ContactNoticeParams {
  readonly translate: Translate;
  readonly isFormEnabled: boolean;
  readonly isSent: boolean;
  readonly error: AppError | null;
  readonly onRetry: () => void;
}

function buildFailureNotice(params: ContactNoticeParams, error: AppError): ContactNoticeView {
  const copy = FAILURE_COPY[error.code] ?? UNEXPECTED_COPY;
  return {
    tone: CONTACT_NOTICE_TONE.Error,
    title: params.translate(copy.titleKey),
    message: params.translate(copy.messageKey),
    retry: copy.isRetryable
      ? { label: params.translate(keys.retry), onRetry: params.onRetry }
      : null,
  };
}

/**
 * The one announcement the contact form's aria-live region carries. Order
 * matters: a switched-off form says so before anything else, a failure is
 * never hidden behind a stale success, and silence is the idle state.
 */
export function buildContactNotice(params: ContactNoticeParams): ContactNoticeView | null {
  if (!params.isFormEnabled) {
    return {
      tone: CONTACT_NOTICE_TONE.Warning,
      title: params.translate(keys.unavailableTitle),
      message: params.translate(keys.unavailableMessage),
      retry: null,
    };
  }
  if (params.error !== null) {
    return buildFailureNotice(params, params.error);
  }
  if (params.isSent) {
    return {
      tone: CONTACT_NOTICE_TONE.Success,
      title: params.translate(keys.sentTitle),
      message: params.translate(keys.sentMessage),
      retry: null,
    };
  }
  return null;
}
