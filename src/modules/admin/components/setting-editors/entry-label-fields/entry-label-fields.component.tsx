import { AppInput, SelectField } from '@/shared/ui';

import type { SettingColorToken } from '../../../constants/setting-values.constants';
import type { EntryLabelFieldsProps } from '../setting-editors.types';

/**
 * The EN/AR label pair (plus optional colour token) every ordered entry
 * carries. The product ships bilingual: both labels are first-class fields,
 * not an afterthought behind a toggle.
 */
export function EntryLabelFields(props: EntryLabelFieldsProps): React.JSX.Element {
  return (
    <>
      <AppInput
        label={props.labels.labelEn}
        name={`${props.idPrefix}-label-en`}
        value={props.labelEn}
        testId={`${props.idPrefix}-label-en`}
        onValueChange={(labelEn) => {
          props.onPatch({ labelEn });
        }}
      />
      <AppInput
        label={props.labels.labelAr}
        name={`${props.idPrefix}-label-ar`}
        value={props.labelAr}
        testId={`${props.idPrefix}-label-ar`}
        onValueChange={(labelAr) => {
          props.onPatch({ labelAr });
        }}
      />
      {props.color === null ? null : (
        <span className={`app-color-token app-color-token--${props.color}`} aria-hidden="true" />
      )}
      {props.color === null ? null : (
        <SelectField
          label={props.labels.color}
          value={props.color}
          options={props.colorOptions}
          testId={`${props.idPrefix}-color`}
          onChange={(color) => {
            props.onPatch({ color: color as SettingColorToken });
          }}
        />
      )}
    </>
  );
}
