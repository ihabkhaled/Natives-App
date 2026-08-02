import { IonText } from '@/packages/ionic';

import type { StandingsDialogFormProps } from './standings-dialog-form.types';

/**
 * The shell every standings write-dialog shares: a labelled form that cancels
 * the browser's native submit, and a heading that doubles as the accessible
 * name. Extracted because the achievement, manual-standing and rule-version
 * forms carried a byte-identical copy of it.
 */
export function StandingsDialogForm(props: StandingsDialogFormProps): React.JSX.Element {
  return (
    <form
      data-testid={props.testId}
      aria-label={props.heading}
      className="app-surface-card app-standings-dialog"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit();
      }}
    >
      <IonText>
        <h3 className="app-standings-dialog__title m-0">{props.heading}</h3>
      </IonText>
      {props.children}
    </form>
  );
}
