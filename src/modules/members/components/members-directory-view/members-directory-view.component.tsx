import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
  PageShell,
  PermissionState,
} from '@/shared/ui';

import { MemberDirectoryList } from '../member-directory-list';
import { MemberInviteForm } from '../member-invite-form';
import { MembersFilterBar } from '../members-filter-bar';
import type { MembersDirectoryViewProps } from './members-directory-view.types';

/** Member directory body: invite, filters, one presented state, and the list. */
export function MembersDirectoryView(props: MembersDirectoryViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.membersPage}>
      <section
        data-testid={TEST_IDS.membersDirectory}
        aria-label={props.title}
        className="app-members flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>
        <MemberInviteForm invite={props.invite} />
        <MembersFilterBar filter={props.filter} />
        {props.status === 'loading' ? (
          <LoadingState
            label={props.loadingLabel}
            testId={TEST_IDS.membersLoading}
            variant="list"
          />
        ) : null}
        {props.status === 'error' ? (
          <ErrorState
            title={props.errorTitle}
            message={props.errorMessage}
            retryLabel={props.retryLabel}
            onRetry={props.onRetry}
            testId={TEST_IDS.membersError}
          />
        ) : null}
        {props.status === 'offline' ? (
          <OfflineState
            title={props.offlineTitle}
            message={props.offlineMessage}
            testId={TEST_IDS.membersOffline}
          />
        ) : null}
        {props.status === 'forbidden' ? (
          <PermissionState
            title={props.forbiddenTitle}
            message={props.forbiddenMessage}
            testId={TEST_IDS.membersForbidden}
          />
        ) : null}
        {props.status === 'empty' ? (
          <EmptyState
            title={props.emptyTitle}
            message={props.emptyMessage}
            testId={TEST_IDS.membersEmpty}
          />
        ) : null}
        {props.status === 'noMatches' ? (
          <EmptyState
            title={props.noMatchesTitle}
            message={props.noMatchesMessage}
            testId={TEST_IDS.membersNoMatches}
          />
        ) : null}
        {props.status === 'ready' ? (
          <>
            <IonText color="medium">
              <p className="app-members__count m-0 text-sm">{props.countSummary}</p>
            </IonText>
            <MemberDirectoryList
              items={props.items}
              heightPx={props.listHeightPx}
              rosterLabel={props.rosterLabel}
              onSelect={props.onSelectMember}
            />
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
