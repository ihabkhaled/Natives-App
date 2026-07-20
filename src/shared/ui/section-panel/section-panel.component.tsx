import { IonNote, IonText } from '@/packages/ionic';

import type { SectionPanelProps } from './section-panel.types';

/**
 * The one panel shell every grouped section renders inside: heading, optional
 * intro, optional advisory notice, then its content.
 */
export function SectionPanel(props: SectionPanelProps): React.JSX.Element {
  return (
    <section
      data-testid={props.testId}
      aria-label={props.heading}
      className="app-surface-card app-section-panel"
    >
      <header className="app-section-panel__head">
        <IonText>
          <h2 className="app-section-panel__title m-0">{props.heading}</h2>
        </IonText>
        {props.intro === undefined ? null : <IonNote>{props.intro}</IonNote>}
      </header>
      {props.notice === undefined || props.notice === null ? null : (
        <p className="app-section-panel__notice m-0" role="note">
          {props.notice}
        </p>
      )}
      {props.children}
    </section>
  );
}
