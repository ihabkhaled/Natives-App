import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { ReminderSummaryProps } from './reminder-summary.types';

/**
 * The loaded reminders body.
 *
 * Split from the screen so the screen owns only which state to show. The
 * outcome list is a live region: a coach who presses "send" is usually looking
 * at the roster, not the button, so the result is announced rather than only
 * rendered.
 */
export function ReminderSummary(props: ReminderSummaryProps): React.JSX.Element {
  return (
    <>
      <dl className="app-section-panel flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-sm">{props.eligibleLabel}</dt>
          <dd className="m-0 text-sm" data-testid={TEST_IDS.practiceRemindersNoResponse}>
            {props.noResponseLabel}
          </dd>
        </div>
      </dl>

      <p className="m-0 text-sm" data-testid={TEST_IDS.practiceRemindersWindow} role="status">
        {props.windowLabel}
      </p>

      <section aria-label={props.kindsHeading}>
        <h2 className="app-section-panel__title m-0">{props.kindsHeading}</h2>
        {props.kindLabels.length === 0 ? (
          <IonText color="medium">
            <p className="m-0 text-sm">{props.kindsEmptyLabel}</p>
          </IonText>
        ) : (
          <ul className="m-0 flex flex-col gap-1 p-0" data-testid={TEST_IDS.practiceRemindersKinds}>
            {props.kindLabels.map((kind) => (
              <li className="text-sm" key={kind}>
                {kind}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <AppButton
          disabled={!props.canDispatch}
          label={props.dispatchLabel}
          loading={props.isDispatching}
          onClick={props.onDispatch}
          testId={TEST_IDS.practiceRemindersDispatch}
          tone="primary"
        />
        <AppButton
          disabled={props.isTesting}
          label={props.testLabel}
          loading={props.isTesting}
          onClick={props.onTest}
          testId={TEST_IDS.practiceRemindersTest}
          tone="secondary"
        />
      </div>

      {props.messages.length === 0 ? null : (
        // The live region is the wrapper, not the list: putting role="status"
        // on the <ul> overrides its list role and orphans every <li>.
        <div data-testid={TEST_IDS.practiceRemindersMessages} role="status">
          <ul className="m-0 flex flex-col gap-1 p-0">
            {props.messages.map((message) => (
              <li className="app-pending-notice text-sm" key={message.id}>
                {message.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
