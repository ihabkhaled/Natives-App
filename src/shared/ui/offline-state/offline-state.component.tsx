import { StatusView } from '../status-view';
import { OFFLINE_STATE_DEFAULT_TEST_ID, OFFLINE_STATE_ICON } from './offline-state.constants';
import type { OfflineStateProps } from './offline-state.types';

export function OfflineState(props: OfflineStateProps): React.JSX.Element {
  return (
    <StatusView
      icon={OFFLINE_STATE_ICON}
      tone="warning"
      title={props.title}
      message={props.message}
      testId={props.testId ?? OFFLINE_STATE_DEFAULT_TEST_ID}
    />
  );
}
