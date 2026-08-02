import { IonText } from '@/packages/ionic';
import { SectionPanel } from '@/shared/ui';

import type { SpiritValuesGridProps } from './spirit-values-grid.types';

/**
 * Spirit-of-the-game values as a responsive card grid. Shared by the About
 * page and the landing page so the two never drift apart or duplicate markup.
 */
export function SpiritValuesGrid(props: SpiritValuesGridProps): React.JSX.Element {
  return (
    <SectionPanel
      heading={props.heading}
      intro={props.intro}
      {...(props.sectionTestId === undefined ? {} : { testId: props.sectionTestId })}
    >
      <div className="app-about-spirit-grid">
        {props.values.map((value) => (
          <div
            key={value.key}
            className="app-about-spirit-card"
            data-testid={`${props.cardTestIdPrefix}-${value.key}`}
          >
            <IonText>
              <h3 className="app-about-spirit-card__title m-0">{value.title}</h3>
            </IonText>
            <IonText color="medium">
              <p className="m-0 text-sm">{value.body}</p>
            </IonText>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
