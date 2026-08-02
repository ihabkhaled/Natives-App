import { cx } from '@/packages/ui-classes';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import { CONTACT_NOTICE_TONE_CLASS } from './contact-notice.constants';
import type { ContactNoticeProps } from './contact-notice.types';

/**
 * The contact form's single announcement. The live region is always mounted
 * and only its contents change, so assistive tech announces the outcome of a
 * submit instead of silently swapping a region in and out of the tree.
 */
export function ContactNotice(props: ContactNoticeProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid={TEST_IDS.contactNotice}
      className={
        props.notice === null
          ? undefined
          : cx('app-contact-notice', CONTACT_NOTICE_TONE_CLASS[props.notice.tone])
      }
    >
      {props.notice === null ? null : (
        <>
          <p className="app-contact-notice__title m-0">{props.notice.title}</p>
          <p className="m-0">{props.notice.message}</p>
          {props.notice.retry === null ? null : (
            <div className="app-contact-notice__actions">
              <AppButton
                label={props.notice.retry.label}
                tone="secondary"
                onClick={props.notice.retry.onRetry}
                testId={TEST_IDS.contactNoticeRetry}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
