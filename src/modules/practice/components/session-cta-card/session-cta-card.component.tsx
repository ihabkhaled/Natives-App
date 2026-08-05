import { IonText } from '@/packages/ionic';
import { AppButton } from '@/shared/ui';

import type { SessionCtaCardProps } from './session-cta-card.types';

/**
 * One session-scoped entry point: a heading and the button that opens it.
 *
 * Shared by attendance and reminders so a second destination is a prop rather
 * than a copied block — the two cards must stay visually identical, and the
 * only way to guarantee that is for there to be one card.
 */
export function SessionCtaCard(props: SessionCtaCardProps): React.JSX.Element {
  return (
    <section
      aria-label={props.heading}
      className="app-surface-card flex flex-wrap items-center justify-between gap-3 p-4"
    >
      <IonText>
        <h2 className="m-0 text-base font-semibold">{props.heading}</h2>
      </IonText>
      <AppButton
        label={props.label}
        tone="secondary"
        testId={props.testId}
        onClick={props.onOpen}
      />
    </section>
  );
}
