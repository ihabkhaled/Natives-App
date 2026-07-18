import { IonText } from '@/packages/ionic';

import type { AdminViewProps } from './admin-view.types';

/** Presentational admin console body. Real tooling arrives in later prompts. */
export function AdminView(props: AdminViewProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <IonText>
        <h2 className="m-0 text-xl font-semibold">{props.heading}</h2>
      </IonText>
      <IonText color="medium">
        <p className="m-0 text-sm">{props.description}</p>
      </IonText>
    </div>
  );
}
