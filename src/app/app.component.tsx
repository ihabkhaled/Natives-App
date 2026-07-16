import type { ReactNode } from 'react';

import { IonApp } from '@/packages/ionic';

export interface AppComponentProps {
  readonly children: ReactNode;
}

/** Root Ionic frame; all app chrome renders inside it. */
export function AppComponent(props: AppComponentProps): React.JSX.Element {
  return <IonApp>{props.children}</IonApp>;
}
