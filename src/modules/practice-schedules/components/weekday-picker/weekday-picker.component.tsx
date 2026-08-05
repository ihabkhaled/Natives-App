import type { WeekdayPickerProps } from './weekday-picker.types';

/**
 * The seven-day toggle group a weekly pattern's `weekdays` is built from. A
 * native `<fieldset>`/`aria-pressed` toggle group rather than a multi-select
 * `<ion-select>`: there is no existing multi-value select in the design
 * system, and seven always-visible day buttons read faster than an opened
 * dropdown for a set this small and this frequently rechecked.
 */
export function WeekdayPicker(props: WeekdayPickerProps): React.JSX.Element {
  return (
    <fieldset className="flex flex-col gap-2" data-testid={props.testId}>
      <legend className="text-sm">{props.label}</legend>
      <div className="flex flex-wrap gap-2">
        {props.options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.selected}
            className={
              option.selected
                ? 'app-weekday-toggle app-weekday-toggle--selected'
                : 'app-weekday-toggle'
            }
            onClick={() => {
              props.onToggle(option.value);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
