import { IonApp } from '@/packages/ionic';

import type { AppComponentProps } from './app.types';

/** Root Ionic frame; all app chrome renders inside it. */
export function AppComponent(props: AppComponentProps): React.JSX.Element {
  return <IonApp>{props.children}</IonApp>;
}
