import { isCollectionBinding } from '../../../helpers/setting-editor-values.helper';
import { CollectionEditorSwitch } from '../collection-editor-switch';
import { FormEditorSwitch } from '../form-editor-switch';
import type { SettingEditorSwitchProps } from '../setting-editors.types';

/**
 * The typed-editor registry, expressed as a discriminated switch: the
 * binding's `settingKey` selects the editor and simultaneously narrows the
 * value and change handler it receives — no casts, no raw JSON.
 */
export function SettingEditorSwitch(props: SettingEditorSwitchProps): React.JSX.Element {
  return isCollectionBinding(props.binding) ? (
    <CollectionEditorSwitch binding={props.binding} context={props.context} />
  ) : (
    <FormEditorSwitch binding={props.binding} context={props.context} />
  );
}
