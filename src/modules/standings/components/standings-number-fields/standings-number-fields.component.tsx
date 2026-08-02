import { AppInput } from '@/shared/ui';

import type { StandingsNumberFieldsProps } from './standings-number-fields.types';

/**
 * The numeric inputs both standings forms lay out in a grid: the manual
 * standing's score fields and the rule version's point fields. Same view
 * model, same markup, so they share it.
 */
export function StandingsNumberFields(props: StandingsNumberFieldsProps): React.JSX.Element {
  return (
    <>
      {props.fields.map((field) => (
        <AppInput
          key={field.id}
          label={field.label}
          name={field.id}
          type="number"
          value={field.value}
          onValueChange={field.onChange}
        />
      ))}
    </>
  );
}
