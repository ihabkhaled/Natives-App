import { AttendanceWeightsEditor } from '../attendance-weights-editor';
import { NotificationRulesEditor } from '../notification-rules-editor';
import { ReportBrandingEditor } from '../report-branding-editor';
import { RosterLimitsEditor } from '../roster-limits-editor';
import type { FormEditorSwitchProps } from '../setting-editors.types';

/** Routes a form-shaped binding to its typed editor. */
export function FormEditorSwitch(props: FormEditorSwitchProps): React.JSX.Element {
  const binding = props.binding;
  return binding.settingKey === 'attendance_weights' ? (
    <AttendanceWeightsEditor
      value={binding.value}
      onChange={binding.onChange}
      context={props.context}
    />
  ) : binding.settingKey === 'roster_limits' ? (
    <RosterLimitsEditor value={binding.value} onChange={binding.onChange} context={props.context} />
  ) : binding.settingKey === 'notification_rules' ? (
    <NotificationRulesEditor
      value={binding.value}
      onChange={binding.onChange}
      context={props.context}
    />
  ) : (
    <ReportBrandingEditor
      value={binding.value}
      onChange={binding.onChange}
      context={props.context}
    />
  );
}
