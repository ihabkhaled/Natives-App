import { IonNote } from '@/packages/ionic';
import { AppInput } from '@/shared/ui';

import type { AdminSlugFieldProps } from './admin-slug-field.types';

/**
 * A slug input with its explanatory note. Both admin editors need exactly this
 * pairing, and a slug is the one field whose rule has to be stated before it is
 * typed rather than after it is rejected.
 */
export function AdminSlugField(props: AdminSlugFieldProps): React.JSX.Element {
  return (
    <>
      <AppInput
        testId={props.testId}
        label={props.field.label}
        name={props.name}
        value={props.field.value}
        disabled={props.field.isReadOnly}
        onValueChange={props.field.onChange}
        errorMessage={props.field.error ?? undefined}
      />
      {props.field.hint === null ? null : (
        <IonNote className="app-member-form__hint">{props.field.hint}</IonNote>
      )}
    </>
  );
}
