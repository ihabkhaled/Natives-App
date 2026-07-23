import { AssessmentScaleEditor } from '../assessment-scale-editor';
import { AttendanceStatusesEditor } from '../attendance-statuses-editor';
import { BadgeTiersEditor } from '../badge-tiers-editor';
import type { CollectionEditorSwitchProps } from '../setting-editors.types';
import { SessionTypesEditor } from '../session-types-editor';

/** Routes an ordered-collection binding to its typed editor. */
export function CollectionEditorSwitch(props: CollectionEditorSwitchProps): React.JSX.Element {
  const binding = props.binding;
  return binding.settingKey === 'attendance_statuses' ? (
    <AttendanceStatusesEditor
      value={binding.value}
      onChange={binding.onChange}
      context={props.context}
    />
  ) : binding.settingKey === 'session_types' ? (
    <SessionTypesEditor value={binding.value} onChange={binding.onChange} context={props.context} />
  ) : binding.settingKey === 'badge_tiers' ? (
    <BadgeTiersEditor value={binding.value} onChange={binding.onChange} context={props.context} />
  ) : (
    <AssessmentScaleEditor
      value={binding.value}
      onChange={binding.onChange}
      context={props.context}
    />
  );
}
