import { StatusView } from '../status-view';
import { EMPTY_STATE_DEFAULT_TEST_ID, EMPTY_STATE_ICON } from './empty-state.constants';
import type { EmptyStateProps } from './empty-state.types';

export function EmptyState(props: EmptyStateProps): React.JSX.Element {
  return (
    <StatusView
      icon={EMPTY_STATE_ICON}
      tone="neutral"
      title={props.title}
      message={props.message}
      testId={props.testId ?? EMPTY_STATE_DEFAULT_TEST_ID}
    />
  );
}
