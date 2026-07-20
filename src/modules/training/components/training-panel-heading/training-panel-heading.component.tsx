import { IonNote, IonText } from '@/packages/ionic';

import type { TrainingPanelHeadingProps } from './training-panel-heading.types';

/** Title + supporting line shared by the composer's sub-panels. */
export function TrainingPanelHeading(props: TrainingPanelHeadingProps): React.JSX.Element {
  return (
    <header className="app-training-panel__head">
      <IonText>
        <h3 className="app-training-panel__title m-0">{props.heading}</h3>
      </IonText>
      <IonNote>{props.intro}</IonNote>
    </header>
  );
}
