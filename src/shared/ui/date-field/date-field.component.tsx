import { APP_ICONS } from '@/packages/icons';
import { IonDatetime, IonIcon, IonNote } from '@/packages/ionic';
import { cx } from '@/packages/ui-classes';

import { AppButton } from '../button';
import {
  buildDateFieldIds,
  buildDatetimeBindings,
  buildTriggerDescribedBy,
  extractDateValue,
} from './date-field.helper';
import type { AppDateFieldProps } from './date-field.types';

/**
 * The design system's date picker.
 *
 * It is deliberately a *button that looks like a field*: a calendar icon, the
 * chosen day (or an explicit "select a date" call to action when nothing is
 * chosen yet), and a caret — bordered, hover/focus lit, and at least 44px tall,
 * so it reads as something you press rather than as a printed value. The
 * previous `ion-datetime-button` rendered a bare grey pill that showed *today*
 * even when the form held no date at all: it read as a static chip and lied
 * about what the form actually held.
 *
 * Pressing it expands a real `ion-datetime` calendar directly beneath the
 * field, so the cause and the effect sit next to each other instead of the
 * calendar taking over the screen from somewhere else. Choosing a day commits
 * and collapses in one gesture. `max` blocks future days to mirror the
 * backend's "not in the future" rule at the edge. Never import the vendor date
 * control directly; every date field renders through here.
 */
export function AppDateField(props: AppDateFieldProps): React.JSX.Element {
  const ids = buildDateFieldIds(props.datetimeId);
  const hasValue = props.value !== '';
  return (
    <div
      data-testid={props.testId}
      className={cx(
        'app-date-field',
        props.errorMessage === undefined ? null : 'app-date-field--invalid',
      )}
    >
      <span id={ids.label} className="app-date-field__label">
        {props.label}
      </span>
      <button
        type="button"
        data-testid={`${props.datetimeId}-trigger`}
        className="app-date-field__trigger"
        aria-labelledby={`${ids.label} ${ids.value}`}
        aria-describedby={buildTriggerDescribedBy(props, ids)}
        aria-haspopup="dialog"
        aria-expanded={props.isOpen}
        aria-controls={ids.panel}
        title={props.openLabel}
        onClick={props.isOpen ? props.onDismiss : props.onOpen}
      >
        <IonIcon icon={APP_ICONS.calendar} aria-hidden="true" className="app-date-field__icon" />
        <span
          id={ids.value}
          className={cx(
            'app-date-field__value',
            hasValue ? null : 'app-date-field__value--placeholder',
          )}
        >
          {hasValue ? props.displayValue : props.placeholder}
        </span>
        <IonIcon
          icon={APP_ICONS.chevronDown}
          aria-hidden="true"
          className="app-date-field__caret"
        />
      </button>
      <div
        id={ids.panel}
        role="dialog"
        aria-label={props.dialogTitle}
        aria-modal="false"
        hidden={!props.isOpen}
        className="app-date-field__panel"
      >
        <IonDatetime
          id={props.datetimeId}
          data-testid={props.inputTestId}
          presentation="date"
          preferWheel={false}
          size="cover"
          aria-labelledby={ids.label}
          {...buildDatetimeBindings(props)}
          onIonChange={(event) => {
            props.onValueChange(extractDateValue(event.detail.value));
          }}
        />
        <AppButton
          label={props.closeLabel}
          tone="secondary"
          onClick={props.onDismiss}
          testId={`${props.datetimeId}-close`}
        />
      </div>
      {props.hint === undefined ? null : (
        <IonNote id={ids.hint} className="app-date-field__hint">
          {props.hint}
        </IonNote>
      )}
      {props.errorMessage === undefined ? null : (
        <IonNote id={ids.error} color="danger" role="alert" className="app-date-field__error">
          {props.errorMessage}
        </IonNote>
      )}
    </div>
  );
}
