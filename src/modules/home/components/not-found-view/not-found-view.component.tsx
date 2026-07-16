import { AppButton, EmptyState } from '@/shared/ui';

import { NOT_FOUND_VIEW_TEST_IDS } from './not-found-view.constants';
import type { NotFoundViewProps } from './not-found-view.types';

export function NotFoundView(props: NotFoundViewProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2">
      <EmptyState title={props.title} message={props.message} />
      <AppButton
        label={props.goHomeLabel}
        tone="secondary"
        onClick={props.onGoHome}
        testId={NOT_FOUND_VIEW_TEST_IDS.goHome}
      />
    </div>
  );
}
