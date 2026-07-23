import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppInput } from '@/shared/ui';

import { numericInputValue, parseDecimalInput } from '../../../helpers/numeric-input.helper';
import { setWeight } from '../../../helpers/setting-editor-values.helper';
import type { AttendanceWeightsEditorProps } from '../setting-editors.types';

/**
 * Weights are structural, not free-form: one row per active counts-toward
 * status effective at the chosen instant, derived from the as-of snapshot.
 * No add/remove — coverage is the shape of the data. When statuses are not
 * configured at that instant, a blocking notice replaces the rows.
 */
export function AttendanceWeightsEditor(props: AttendanceWeightsEditorProps): React.JSX.Element {
  const weights = props.context.weights;
  return (
    <div className="app-editor-entry" data-testid={TEST_IDS.adminSettingEditor}>
      {weights.loadingNotice === null ? null : <IonNote>{weights.loadingNotice}</IonNote>}
      {weights.blockedNotice === null ? null : (
        <p
          className="app-editor-blocked m-0"
          role="alert"
          data-testid={TEST_IDS.adminWeightsBlocked}
        >
          {weights.blockedNotice}
        </p>
      )}
      {weights.rows.map((row) => (
        <div key={row.code} className="app-editor-entry__row" data-testid={TEST_IDS.adminEditorRow}>
          <span className="app-code-chip">{row.code}</span>
          <AppInput
            label={`${row.label} — ${props.context.labels.weightLabel}`}
            name={`weight-${row.code}`}
            type="number"
            value={numericInputValue(props.value.weights[row.code])}
            testId={`${TEST_IDS.adminEditorRow}-weight-${row.code}`}
            onValueChange={(raw) => {
              props.onChange(setWeight(props.value, row.code, parseDecimalInput(raw) ?? null));
            }}
          />
        </div>
      ))}
    </div>
  );
}
