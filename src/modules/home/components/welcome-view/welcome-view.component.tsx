import { IonText } from '@/packages/ionic';
import { AppButton } from '@/shared/ui';

import { WELCOME_VIEW_TEST_IDS } from './welcome-view.constants';
import type { WelcomeViewProps } from './welcome-view.types';

export function WelcomeView(props: WelcomeViewProps): React.JSX.Element {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <IonText>
        <h1 className="m-0 text-2xl font-bold">{props.title}</h1>
      </IonText>
      <IonText color="medium">
        <p className="m-0 max-w-md text-base">{props.subtitle}</p>
      </IonText>
      <AppButton
        label={props.loginCta}
        onClick={props.onLoginClick}
        testId={WELCOME_VIEW_TEST_IDS.loginCta}
      />
    </div>
  );
}
