import { APP_ICONS } from '@/packages/icons';
import { IonDatetime, IonIcon, IonNote } from '@/packages/ionic';
import { cx } from '@/packages/ui-classes';

import { AppButton } from '../button';
import { buildPickerDescribedBy, buildPickerFieldIds } from './picker-field.helper';
import type { PickerFieldProps } from './picker-field.types';

/**
 * The calendar-field core of the design system.
 *
 * It is deliberately a *button that looks like a field*: a calendar icon, the
 * chosen value (or an explicit call to action when nothing is chosen yet),
 * and a caret — bordered, hover/focus lit, and at least 44px tall, so it
 * reads as something you press rather than as a printed value. Pressing it
 * expands a real `ion-datetime` directly beneath the field, so cause and
 * effect sit next to each other; choosing commits and collapses in one
 * gesture. Concrete fields (`AppDateField`, `AppDateTimeField`) provide the
 * presentation, the value semantics, and the min/max policy. Never import
 * the vendor date control directly; every calendar field renders through
 * here.
 */
export function PickerField(props: PickerFieldProps): React.JSX.Element {
  const ids = buildPickerFieldIds(props.datetimeId);
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
        aria-describedby={buildPickerDescribedBy(props, ids)}
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
            props.hasValue ? null : 'app-date-field__value--placeholder',
          )}
        >
          {props.hasValue ? props.displayValue : props.placeholder}
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
          presentation={props.presentation}
          preferWheel={false}
          size="cover"
          aria-labelledby={ids.label}
          {...props.bindings}
          onIonChange={(event) => {
            props.onPickerChange(event.detail.value);
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
