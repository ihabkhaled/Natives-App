import { IonText } from '@/packages/ionic';
import { AppButton, LoadingState } from '@/shared/ui';

import { HOME_VIEW_TEST_IDS } from './home-view.constants';
import type { HomeViewProps } from './home-view.types';

export function HomeView(props: HomeViewProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      {props.isLoadingUser ? (
        <LoadingState label={props.loadingLabel} />
      ) : (
        <IonText>
          <h2 className="m-0 text-xl font-semibold" data-testid={HOME_VIEW_TEST_IDS.greeting}>
            {props.greeting}
          </h2>
        </IonText>
      )}
      {props.healthSlot}
      <AppButton
        label={props.logoutLabel}
        tone="secondary"
        onClick={props.onLogout}
        loading={props.isLoggingOut}
        testId={HOME_VIEW_TEST_IDS.logout}
      />
    </div>
  );
}
