import { TEST_IDS } from '@/shared/config';
import {
  AppButton,
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
  PageShell,
  PermissionState,
} from '@/shared/ui';

import { MemberProfileBody } from '../member-profile-body';
import type { MemberProfileViewProps } from './member-profile-view.types';

/** Member profile screen: back action, one presented state, and the body. */
export function MemberProfileView(props: MemberProfileViewProps): React.JSX.Element {
  return (
    <PageShell
      title={props.title}
      testId={TEST_IDS.memberProfilePage}
      headerEnd={
        <AppButton
          testId={TEST_IDS.memberProfileBack}
          label={props.backLabel}
          tone="secondary"
          onClick={props.onBack}
        />
      }
    >
      <section
        data-testid={TEST_IDS.memberProfileView}
        aria-label={props.title}
        className="app-profile flex flex-col gap-5"
      >
        {props.status === 'loading' ? (
          <LoadingState
            label={props.loadingLabel}
            testId={TEST_IDS.memberProfileLoading}
            variant="detail"
          />
        ) : null}
        {props.status === 'error' ? (
          <ErrorState
            title={props.errorTitle}
            message={props.errorMessage}
            retryLabel={props.retryLabel}
            onRetry={props.onRetry}
            testId={TEST_IDS.memberProfileError}
          />
        ) : null}
        {props.status === 'offline' ? (
          <OfflineState
            title={props.offlineTitle}
            message={props.offlineMessage}
            testId={TEST_IDS.offlineState}
          />
        ) : null}
        {props.status === 'forbidden' ? (
          <PermissionState
            title={props.forbiddenTitle}
            message={props.forbiddenMessage}
            testId={TEST_IDS.memberProfileForbidden}
          />
        ) : null}
        {props.status === 'notFound' ? (
          <EmptyState
            title={props.notFoundTitle}
            message={props.notFoundMessage}
            testId={TEST_IDS.emptyState}
          />
        ) : null}
        {props.status === 'ready' ? <MemberProfileBody {...props} /> : null}
      </section>
    </PageShell>
  );
}
