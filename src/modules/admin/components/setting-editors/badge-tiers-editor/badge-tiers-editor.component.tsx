import { TEST_IDS } from '@/shared/config';
import { AppInput, moveArrayItem, removeArrayItem, ReorderableRows } from '@/shared/ui';

import { integerFieldPatch, numericInputValue } from '../../../helpers/numeric-input.helper';
import {
  addBadgeTier,
  buildRowControls,
  patchBadgeTier,
} from '../../../helpers/setting-editor-values.helper';
import type { BadgeTier } from '../../../types/setting-values.types';
import { EntryLabelFields } from '../entry-label-fields';
import type { BadgeTiersEditorProps } from '../setting-editors.types';

/**
 * Ordered badge tiers: array order is rank, and thresholds must climb with
 * it — the validation list flags a tier that breaks the ascent.
 */
export function BadgeTiersEditor(props: BadgeTiersEditorProps): React.JSX.Element {
  const labels = props.context.labels;
  const tiers = props.value.tiers;
  const move = (index: number, offset: -1 | 1): void => {
    props.onChange({ tiers: moveArrayItem(tiers, index, offset) });
  };
  const remove = (index: number): void => {
    props.onChange({ tiers: removeArrayItem(tiers, index) });
  };
  const patch = (index: number, tierPatch: Partial<BadgeTier>): void => {
    props.onChange(patchBadgeTier(props.value, index, tierPatch));
  };
  return (
    <ReorderableRows
      ariaLabel={props.context.keyLabels.badge_tiers}
      addLabel={labels.tiersAdd}
      onAdd={() => {
        props.onChange(addBadgeTier(props.value));
      }}
      testId={TEST_IDS.adminSettingEditor}
      rowTestId={TEST_IDS.adminEditorRow}
      addTestId={TEST_IDS.adminEditorAdd}
      rows={tiers.map((tier, index) => ({
        key: tier.key,
        ...buildRowControls({
          index,
          count: tiers.length,
          labels,
          onMove: move,
          onRemove: remove,
        }),
        content: (
          <div className="app-editor-entry">
            <AppInput
              label={labels.tierKey}
              name={`tier-key-${index}`}
              value={tier.key}
              testId={`${TEST_IDS.adminEditorRow}-key-${index}`}
              onValueChange={(key) => {
                patch(index, { key });
              }}
            />
            <EntryLabelFields
              idPrefix={`tier-${index}`}
              labels={labels}
              labelEn={tier.labelEn}
              labelAr={tier.labelAr}
              color={tier.color}
              colorOptions={props.context.colorOptions}
              onPatch={(fieldPatch) => {
                patch(index, fieldPatch);
              }}
            />
            <AppInput
              label={labels.threshold}
              name={`tier-threshold-${index}`}
              type="number"
              value={numericInputValue(tier.threshold)}
              testId={`${TEST_IDS.adminEditorRow}-threshold-${index}`}
              onValueChange={(raw) => {
                patch(index, integerFieldPatch('threshold', raw));
              }}
            />
          </div>
        ),
      }))}
    />
  );
}
