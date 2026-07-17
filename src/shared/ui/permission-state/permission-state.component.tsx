import { StatusView } from '../status-view';
import {
  PERMISSION_STATE_DEFAULT_TEST_ID,
  PERMISSION_STATE_ICON,
} from './permission-state.constants';
import type { PermissionStateProps } from './permission-state.types';

export function PermissionState(props: PermissionStateProps): React.JSX.Element {
  return (
    <StatusView
      icon={PERMISSION_STATE_ICON}
      tone="warning"
      title={props.title}
      message={props.message}
      testId={props.testId ?? PERMISSION_STATE_DEFAULT_TEST_ID}
    />
  );
}
