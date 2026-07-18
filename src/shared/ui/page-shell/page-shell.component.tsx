import { IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@/packages/ionic';

import type { PageShellProps } from './page-shell.types';

/** Canonical routed-screen skeleton: every route renders inside an IonPage. */
export function PageShell(props: PageShellProps): React.JSX.Element {
  return (
    <IonPage data-testid={props.testId}>
      {props.immersive === true ? null : (
        <IonHeader>
          <IonToolbar>
            <IonTitle>{props.title}</IonTitle>
            {props.headerEnd === undefined ? null : (
              <IonButtons slot="end">{props.headerEnd}</IonButtons>
            )}
          </IonToolbar>
        </IonHeader>
      )}
      {props.banner}
      <IonContent className={props.immersive === true ? 'app-page--immersive' : 'ion-padding'}>
        {props.children}
      </IonContent>
    </IonPage>
  );
}
