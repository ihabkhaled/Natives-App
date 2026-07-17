import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { openUrlInAppBrowser } from '../browser/browser.facade';
import {
  DEFAULT_EXTERNAL_URL_POLICY,
  isAllowedExternalUrl,
  parseUrlSafely,
  type ExternalUrlPolicy,
} from '../security/url-policy.parser';

/**
 * The only path to external content. Validates against the URL policy
 * before opening; rejected URLs surface as a typed AppError.
 */
export async function openExternalUrl(
  rawUrl: string,
  policy: ExternalUrlPolicy = DEFAULT_EXTERNAL_URL_POLICY,
): Promise<void> {
  if (!isAllowedExternalUrl(rawUrl, policy)) {
    throw new AppError({ code: APP_ERROR_CODE.DeepLinkRejected, message: 'Blocked external URL' });
  }
  const url = parseUrlSafely(rawUrl);
  if (url === null) {
    throw new AppError({ code: APP_ERROR_CODE.DeepLinkRejected, message: 'Unparseable URL' });
  }
  await openUrlInAppBrowser(url);
}
