import { IonIcon, IonText } from '@/packages/ionic';

import { statusIconVariants } from './status-view.variants';
import type { StatusViewProps } from './status-view.types';

/** Shared skeleton for empty, error, offline, and permission states. */
export function StatusView(props: StatusViewProps): React.JSX.Element {
  return (
    <div
      data-testid={props.testId}
      className="flex min-h-40 flex-col items-center justify-center gap-1 p-6 text-center"
      role="status"
    >
      <IonIcon
        icon={props.icon}
        className={statusIconVariants({ tone: props.tone })}
        aria-hidden="true"
      />
      <IonText>
        <h2 className="m-0 text-lg font-semibold">{props.title}</h2>
      </IonText>
      {props.message === undefined ? null : (
        <IonText color="medium">
          <p className="m-0 text-sm">{props.message}</p>
        </IonText>
      )}
      {props.action === undefined ? null : <div className="mt-3">{props.action}</div>}
    </div>
  );
}
